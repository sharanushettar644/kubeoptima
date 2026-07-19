package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/dynamic/dynamicinformer"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/cache"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/workqueue"

	"kubeoptima/k8s-operator/internal/controllers"
)

// KubeOptima Operator manages:
//   - OptimizationPolicy CRD
//   - NodePool CRD
//   - MigrationJob CRD
//
// It watches cluster state via informers and reconciles
// desired optimization state against actual cluster state.

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	slog.SetDefault(logger)

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	// Build kubeconfig
	kubeconfig := os.Getenv("KUBECONFIG")
	config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		slog.Error("Failed to build kubeconfig", "error", err)
		os.Exit(1)
	}

	// Clients
	kubeClient, err := kubernetes.NewForConfig(config)
	if err != nil {
		slog.Error("Failed to create kube client", "error", err)
		os.Exit(1)
	}

	dynamicClient, err := dynamic.NewForConfig(config)
	if err != nil {
		slog.Error("Failed to create dynamic client", "error", err)
		os.Exit(1)
	}

	// Informer factory — resync every 30s
	factory := informers.NewSharedInformerFactory(kubeClient, 30*time.Second)

	// Dynamic informers for CRDs
	dynamicFactory := dynamicinformer.NewDynamicSharedInformerFactory(dynamicClient, 30*time.Second)

	// CRD GVRs
	optimizationPolicyGVR := schema.GroupVersionResource{
		Group:    "kubeoptima.ai",
		Version:  "v1alpha1",
		Resource: "optimizationpolicies",
	}
	nodePoolGVR := schema.GroupVersionResource{
		Group:    "kubeoptima.ai",
		Version:  "v1alpha1",
		Resource: "nodepools",
	}
	migrationJobGVR := schema.GroupVersionResource{
		Group:    "kubeoptima.ai",
		Version:  "v1alpha1",
		Resource: "migrationjobs",
	}

	// Work queues
	policyQueue := workqueue.NewRateLimitingQueue(workqueue.DefaultControllerRateLimiter())
	nodePoolQueue := workqueue.NewRateLimitingQueue(workqueue.DefaultControllerRateLimiter())
	migrationQueue := workqueue.NewRateLimitingQueue(workqueue.DefaultControllerRateLimiter())

	// Informers
	policyInformer := dynamicFactory.ForResource(optimizationPolicyGVR).Informer()
	nodePoolInformer := dynamicFactory.ForResource(nodePoolGVR).Informer()
	migrationInformer := dynamicFactory.ForResource(migrationJobGVR).Informer()
	podInformer := factory.Core().V1().Pods().Informer()
	nodeInformer := factory.Core().V1().Nodes().Informer()

	// Register event handlers
	policyInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc:    func(obj interface{}) { enqueue(policyQueue, obj) },
		UpdateFunc: func(_, obj interface{}) { enqueue(policyQueue, obj) },
		DeleteFunc: func(obj interface{}) { enqueue(policyQueue, obj) },
	})

	nodeInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc:    func(obj interface{}) { enqueue(nodePoolQueue, obj) },
		UpdateFunc: func(_, obj interface{}) { enqueue(nodePoolQueue, obj) },
	})

	migrationInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc:    func(obj interface{}) { enqueue(migrationQueue, obj) },
		UpdateFunc: func(_, obj interface{}) { enqueue(migrationQueue, obj) },
	})

	// Controllers
	policyController := controllers.NewOptimizationPolicyController(
		kubeClient, dynamicClient, policyInformer, policyQueue,
	)
	nodePoolController := controllers.NewNodePoolController(
		kubeClient, dynamicClient, nodePoolInformer, nodeInformer, nodePoolQueue,
	)
	migrationController := controllers.NewMigrationJobController(
		kubeClient, dynamicClient, migrationInformer, podInformer, migrationQueue,
	)

	// Start informers
	factory.Start(ctx.Done())
	dynamicFactory.Start(ctx.Done())

	// Wait for cache sync
	factory.WaitForCacheSync(ctx.Done())
	dynamicFactory.WaitForCacheSync(ctx.Done())

	slog.Info("✅ KubeOptima Operator caches synced — starting controllers")

	// Run controllers
	go policyController.Run(ctx, 4)
	go nodePoolController.Run(ctx, 2)
	go migrationController.Run(ctx, 2)

	slog.Info("🚀 KubeOptima Operator running", "version", "v1.0.0")
	<-ctx.Done()
	slog.Info("Operator shutting down...")
}

func enqueue(q workqueue.RateLimitingInterface, obj interface{}) {
	if key, err := cache.MetaNamespaceKeyFunc(obj); err == nil {
		q.Add(key)
	}
}
