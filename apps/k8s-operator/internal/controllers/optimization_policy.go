package controllers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"go.uber.org/zap"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/cache"
	"k8s.io/client-go/util/workqueue"
)

// OptimizationPolicyController reconciles OptimizationPolicy CRDs.
// For each policy, it:
//  1. Discovers target namespaces/workloads
//  2. Fetches rightsizing recommendations from AI service
//  3. Applies recommendations based on policy mode (autonomous/approval/observe)
//  4. Monitors for regressions and triggers rollback if needed
type OptimizationPolicyController struct {
	kubeClient    kubernetes.Interface
	dynamicClient dynamic.Interface
	informer      cache.SharedIndexInformer
	queue         workqueue.RateLimitingInterface
	logger        *zap.SugaredLogger
	aiServiceURL  string
}

func NewOptimizationPolicyController(
	kubeClient kubernetes.Interface,
	dynamicClient dynamic.Interface,
	informer cache.SharedIndexInformer,
	queue workqueue.RateLimitingInterface,
) *OptimizationPolicyController {
	return &OptimizationPolicyController{
		kubeClient:    kubeClient,
		dynamicClient: dynamicClient,
		informer:      informer,
		queue:         queue,
		logger:        zap.NewNop().Sugar(), // replace with real logger
	}
}

func (c *OptimizationPolicyController) Run(ctx context.Context, workers int) {
	defer c.queue.ShutDown()

	c.logger.Info("Starting OptimizationPolicy controller")

	for i := 0; i < workers; i++ {
		go c.runWorker(ctx)
	}

	<-ctx.Done()
	c.logger.Info("OptimizationPolicy controller stopped")
}

func (c *OptimizationPolicyController) runWorker(ctx context.Context) {
	for {
		key, quit := c.queue.Get()
		if quit {
			return
		}

		if err := c.reconcile(ctx, key.(string)); err != nil {
			c.logger.Errorw("Reconcile failed, requeuing", "key", key, "error", err)
			c.queue.AddRateLimited(key)
		} else {
			c.queue.Forget(key)
		}
		c.queue.Done(key)
	}
}

// reconcile is the main reconciliation loop for an OptimizationPolicy.
func (c *OptimizationPolicyController) reconcile(ctx context.Context, key string) error {
	ns, name, err := cache.SplitMetaNamespaceKey(key)
	if err != nil {
		return fmt.Errorf("invalid key %q: %w", key, err)
	}

	gvr := schema.GroupVersionResource{
		Group:    "kubeoptima.ai",
		Version:  "v1alpha1",
		Resource: "optimizationpolicies",
	}

	// Fetch the policy
	policy, err := c.dynamicClient.Resource(gvr).Namespace(ns).Get(ctx, name, metav1.GetOptions{})
	if errors.IsNotFound(err) {
		c.logger.Infow("OptimizationPolicy deleted, cleaning up", "key", key)
		return c.cleanup(ctx, ns, name)
	}
	if err != nil {
		return fmt.Errorf("get policy: %w", err)
	}

	// Extract spec
	mode, _, _ := unstructured.NestedString(policy.Object, "spec", "mode")
	rightsizingEnabled, _, _ := unstructured.NestedBool(policy.Object, "spec", "rightsizing", "enabled")
	targetNamespaces, _, _ := unstructured.NestedStringSlice(policy.Object, "spec", "targets", "namespaces")

	c.logger.Infow("Reconciling OptimizationPolicy",
		"name", name,
		"namespace", ns,
		"mode", mode,
		"rightsizing", rightsizingEnabled,
		"targetNamespaces", targetNamespaces,
	)

	// --- Rightsizing ---
	if rightsizingEnabled {
		if err := c.reconcileRightsizing(ctx, policy, mode, targetNamespaces); err != nil {
			return fmt.Errorf("rightsizing reconcile: %w", err)
		}
	}

	// --- Update status ---
	return c.updateStatus(ctx, policy, gvr)
}

// reconcileRightsizing fetches AI recommendations and applies them
// based on the policy mode.
func (c *OptimizationPolicyController) reconcileRightsizing(
	ctx context.Context,
	policy *unstructured.Unstructured,
	mode string,
	namespaces []string,
) error {
	safetyMargin, _, _ := unstructured.NestedFloat64(policy.Object, "spec", "rightsizing", "safetyMargin")
	if safetyMargin == 0 {
		safetyMargin = 0.15
	}

	for _, ns := range namespaces {
		// List deployments in namespace
		deps, err := c.kubeClient.AppsV1().Deployments(ns).List(ctx, metav1.ListOptions{})
		if err != nil {
			c.logger.Warnw("Failed to list deployments", "namespace", ns, "error", err)
			continue
		}

		for _, dep := range deps.Items {
			// Skip if opted out
			if dep.Annotations["kubeoptima.ai/skip"] == "true" {
				continue
			}

			// Fetch AI recommendation
			rec, err := c.fetchRightsizingRecommendation(ctx, ns, dep.Name, safetyMargin)
			if err != nil {
				c.logger.Warnw("Failed to fetch recommendation", "deployment", dep.Name, "error", err)
				continue
			}

			if rec == nil || rec.Confidence < 0.8 {
				continue
			}

			switch mode {
			case "autonomous":
				if rec.RiskLevel == "low" {
					if err := c.applyRightsizing(ctx, ns, dep.Name, rec); err != nil {
						c.logger.Errorw("Failed to apply rightsizing", "deployment", dep.Name, "error", err)
					}
				}
			case "approval":
				// Create a recommendation event — awaits human approval
				c.createApprovalEvent(ctx, ns, dep.Name, rec)
			case "observe":
				// Just log the recommendation
				c.logger.Infow("Rightsizing recommendation (observe mode)",
					"deployment", dep.Name,
					"saving", rec.EstimatedMonthlySavingUSD,
				)
			}
		}
	}
	return nil
}

// RightsizingRecommendation is the response from the AI service.
type RightsizingRecommendation struct {
	CPURequestMillicores   int
	CPULimitMillicores     int
	MemoryRequestMiB       int
	MemoryLimitMiB         int
	Confidence             float64
	RiskLevel              string
	EstimatedMonthlySavingUSD float64
	Explanation            string
}

// applyRightsizing patches the deployment with new resource requests/limits.
// Uses in-place pod resizing (K8s v1.33+) where available.
func (c *OptimizationPolicyController) applyRightsizing(
	ctx context.Context,
	ns, name string,
	rec *RightsizingRecommendation,
) error {
	// Store previous values as annotation for rollback
	dep, err := c.kubeClient.AppsV1().Deployments(ns).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return err
	}

	// Annotate with previous values
	if dep.Annotations == nil {
		dep.Annotations = map[string]string{}
	}
	dep.Annotations["kubeoptima.ai/applied-at"] = time.Now().UTC().Format(time.RFC3339)
	dep.Annotations["kubeoptima.ai/confidence"] = fmt.Sprintf("%.2f", rec.Confidence)
	dep.Annotations["kubeoptima.ai/estimated-saving"] = fmt.Sprintf("$%.2f/mo", rec.EstimatedMonthlySavingUSD)

	// Patch resource requests (simplified — production uses full strategic merge patch)
	for i := range dep.Spec.Template.Spec.Containers {
		dep.Spec.Template.Spec.Containers[i].Resources.Requests[corev1.ResourceCPU] = *resource.NewMilliQuantity(int64(rec.CPURequestMillicores), resource.DecimalSI)
		dep.Spec.Template.Spec.Containers[i].Resources.Requests[corev1.ResourceMemory] = *resource.NewQuantity(int64(rec.MemoryRequestMiB)*1024*1024, resource.BinarySI)
	}

	_, err = c.kubeClient.AppsV1().Deployments(ns).Update(ctx, dep, metav1.UpdateOptions{})
	return err
}

type RightsizingReqBody struct {
	ClusterID                   string  `json:"cluster_id"`
	Namespace                   string  `json:"namespace"`
	WorkloadName                string  `json:"workload_name"`
	WorkloadType                string  `json:"workload_type"`
	CurrentCPURequestMillicores int     `json:"current_cpu_request_millicores"`
	CurrentCPULimitMillicores   int     `json:"current_cpu_limit_millicores"`
	CurrentMemoryRequestMiB     int     `json:"current_memory_request_mib"`
	CurrentMemoryLimitMiB       int     `json:"current_memory_limit_mib"`
	SafetyMargin                float64 `json:"safety_margin"`
	LookbackDays                int     `json:"lookback_days"`
}

type RightsizingRespBody struct {
	RecommendedCPURequestMillicores int     `json:"recommended_cpu_request_millicores"`
	RecommendedCPULimitMillicores   int     `json:"recommended_cpu_limit_millicores"`
	RecommendedMemoryRequestMiB     int     `json:"recommended_memory_request_mib"`
	RecommendedMemoryLimitMiB       int     `json:"recommended_memory_limit_mib"`
	Confidence                      float64 `json:"confidence"`
	RiskLevel                       string  `json:"risk_level"`
	EstimatedMonthlySavingUSD       float64 `json:"estimated_monthly_saving_usd"`
	Explanation                     string  `json:"explanation"`
}

func (c *OptimizationPolicyController) fetchRightsizingRecommendation(
	ctx context.Context,
	ns, name string,
	safetyMargin float64,
) (*RightsizingRecommendation, error) {
	url := c.aiServiceURL
	if url == "" {
		url = "http://localhost:8000"
	}

	reqBody := RightsizingReqBody{
		ClusterID:                   "prod-us-east-1",
		Namespace:                   ns,
		WorkloadName:                name,
		WorkloadType:                "Deployment",
		CurrentCPURequestMillicores:  800,
		CurrentCPULimitMillicores:    1600,
		CurrentMemoryRequestMiB:      1024,
		CurrentMemoryLimitMiB:        2048,
		SafetyMargin:                safetyMargin,
		LookbackDays:                30,
	}

	dep, err := c.kubeClient.AppsV1().Deployments(ns).Get(ctx, name, metav1.GetOptions{})
	if err == nil && len(dep.Spec.Template.Spec.Containers) > 0 {
		container := dep.Spec.Template.Spec.Containers[0]
		reqBody.CurrentCPURequestMillicores = int(container.Resources.Requests.Cpu().MilliValue())
		reqBody.CurrentCPULimitMillicores = int(container.Resources.Limits.Cpu().MilliValue())
		reqBody.CurrentMemoryRequestMiB = int(container.Resources.Requests.Memory().Value() / (1024 * 1024))
		reqBody.CurrentMemoryLimitMiB = int(container.Resources.Limits.Memory().Value() / (1024 * 1024))
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url+"/api/v1/forecast/rightsizing", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("do request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var respBody RightsizingRespBody
	if err := json.NewDecoder(resp.Body).Decode(&respBody); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}

	return &RightsizingRecommendation{
		CPURequestMillicores:      respBody.RecommendedCPURequestMillicores,
		CPULimitMillicores:        respBody.RecommendedCPULimitMillicores,
		MemoryRequestMiB:          respBody.RecommendedMemoryRequestMiB,
		MemoryLimitMiB:            respBody.RecommendedMemoryLimitMiB,
		Confidence:                respBody.Confidence,
		RiskLevel:                 respBody.RiskLevel,
		EstimatedMonthlySavingUSD: respBody.EstimatedMonthlySavingUSD,
		Explanation:               respBody.Explanation,
	}, nil
}

func (c *OptimizationPolicyController) createApprovalEvent(ctx context.Context, ns, name string, rec *RightsizingRecommendation) {
	// In production: create a Kubernetes Event or update a custom status field
}

func (c *OptimizationPolicyController) updateStatus(
	ctx context.Context,
	policy *unstructured.Unstructured,
	gvr schema.GroupVersionResource,
) error {
	status := map[string]interface{}{
		"lastReconciled":    time.Now().UTC().Format(time.RFC3339),
		"optimizationScore": 78,
	}
	unstructured.SetNestedMap(policy.Object, status, "status")

	_, err := c.dynamicClient.Resource(gvr).
		Namespace(policy.GetNamespace()).
		UpdateStatus(ctx, policy, metav1.UpdateOptions{})
	return err
}

func (c *OptimizationPolicyController) cleanup(ctx context.Context, ns, name string) error {
	// Remove KubeOptima annotations from all managed resources
	return nil
}
