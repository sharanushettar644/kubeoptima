package handlers

import (
	"fmt"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
)

func getAIServiceURL() string {
	url := os.Getenv("AI_SERVICE_URL")
	if url == "" {
		url = "http://localhost:8000"
	}
	return url
}

// ReadinessHandler check readiness status
func ReadinessHandler(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "ready", "time": time.Now().UTC()})
}

// --- Clusters ---
func ListClusters(c *fiber.Ctx) error {
	return c.JSON([]fiber.Map{
		{"id": "prod-us-east-1", "name": "prod-us-east-1", "provider": "aws", "region": "us-east-1", "nodes": 42, "status": "connected"},
		{"id": "prod-us-west-2", "name": "prod-us-west-2", "provider": "aws", "region": "us-west-2", "nodes": 28, "status": "connected"},
		{"id": "staging-eu-west-1", "name": "staging-eu-west-1", "provider": "aws", "region": "eu-west-1", "nodes": 15, "status": "connected"},
	})
}

func GetCluster(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"id": c.Params("clusterID"), "name": c.Params("clusterID"), "provider": "aws", "region": "us-east-1", "nodes": 42, "status": "connected",
	})
}

func ListNodes(c *fiber.Ctx) error {
	return c.JSON([]fiber.Map{
		{"name": "node-1", "type": "t3.medium", "status": "Ready", "cpu": "55%", "mem": "62%"},
		{"name": "node-2", "type": "t3.medium", "status": "Ready", "cpu": "42%", "mem": "51%"},
	})
}

func ListPods(c *fiber.Ctx) error {
	return c.JSON([]fiber.Map{
		{"name": "api-server-xyz", "namespace": "production", "status": "Running", "cpu": "120m", "mem": "256Mi"},
		{"name": "dashboard-abc", "namespace": "kubeoptima", "status": "Running", "cpu": "45m", "mem": "90Mi"},
	})
}

func GetClusterMetrics(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"cpu_utilization":    58.5,
		"memory_utilization": 64.2,
		"network_in_mbps":    142.5,
		"network_out_mbps":   98.2,
	})
}

func GetClusterHealth(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"score":      94,
		"status":     "healthy",
		"conditions": []string{"ControlPlaneHealthy", "NodeGroupsHealthy", "AddonsHealthy"},
	})
}

// --- Recommendations ---
func ListRecommendations(c *fiber.Ctx) error {
	agent := fiber.Get(fmt.Sprintf("%s/api/v1/recommendations/", getAIServiceURL()))
	statusCode, body, errs := agent.Bytes()
	if len(errs) > 0 {
		// Fallback static data
		return c.JSON([]fiber.Map{
			{
				"id": "rec-1", "type": "rightsizing", "title": "Downsize API pods — CPU over-provisioned 4×",
				"namespace": "production", "workload_name": "api-server", "impact": "high", "saving": "$2,840/mo", "confidence": 0.94, "risk_level": "low",
			},
			{
				"id": "rec-2", "type": "spot", "title": "Migrate stateless workers to Spot",
				"namespace": "processing", "workload_name": "batch-workers", "impact": "high", "saving": "$5,120/mo", "confidence": 0.88, "risk_level": "medium",
			},
		})
	}
	c.Status(statusCode)
	return c.Send(body)
}

func GetRecommendation(c *fiber.Ctx) error {
	agent := fiber.Get(fmt.Sprintf("%s/api/v1/recommendations/%s", getAIServiceURL(), c.Params("id")))
	statusCode, body, errs := agent.Bytes()
	if len(errs) > 0 {
		return c.JSON(fiber.Map{"id": c.Params("id"), "title": "Recommendation Detail"})
	}
	c.Status(statusCode)
	return c.Send(body)
}

func ApplyRecommendation(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "applied", "id": c.Params("id"), "applied_at": time.Now().UTC()})
}

func DismissRecommendation(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "dismissed", "id": c.Params("id")})
}

func ScheduleRecommendation(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "scheduled", "id": c.Params("id")})
}

// --- Rightsizing ---
func ListPodRightsizing(c *fiber.Ctx) error {
	agent := fiber.Get(fmt.Sprintf("%s/api/v1/rightsizing/pods", getAIServiceURL()))
	statusCode, body, errs := agent.Bytes()
	if len(errs) > 0 {
		return c.JSON([]fiber.Map{
			{"name": "api-server", "cpu": 800, "recommended_cpu": 250, "mem": 1024, "recommended_mem": 400},
		})
	}
	c.Status(statusCode)
	return c.Send(body)
}

func ListNodeRightsizing(c *fiber.Ctx) error {
	agent := fiber.Get(fmt.Sprintf("%s/api/v1/rightsizing/nodes", getAIServiceURL()))
	statusCode, body, errs := agent.Bytes()
	if len(errs) > 0 {
		return c.JSON([]fiber.Map{
			{"current": "m5.4xlarge", "recommended": "c7g.2xlarge", "saving": "$340/mo"},
		})
	}
	c.Status(statusCode)
	return c.Send(body)
}

func ApplyPodRightsizing(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "success", "namespace": c.Params("namespace"), "name": c.Params("name")})
}

func MigrateNode(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "migration_triggered", "node": c.Params("name")})
}

// --- Autoscaling ---
func GetScalingForecast(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"forecast": []fiber.Map{
			{"time": "12:00", "load": 45},
			{"time": "13:00", "load": 52},
		},
	})
}

func GetScalingEvents(c *fiber.Ctx) error {
	return c.JSON([]fiber.Map{
		{"time": "09:00", "type": "scale-up", "nodes": "+3", "reason": "Morning traffic spike"},
	})
}

func OverrideScaling(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "override_active"})
}

// --- Migrations ---
func ListMigrations(c *fiber.Ctx) error {
	return c.JSON([]fiber.Map{
		{"id": "mig-1", "pod": "api-server-6d4f8b-x2k9p", "status": "running", "progress": 72},
	})
}

func GetMigration(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"id": c.Params("id"), "pod": "api-server-6d4f8b-x2k9p", "status": "running"})
}

func CreateMigration(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "migration_created", "id": "mig-2"})
}

func CancelMigration(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "cancelled", "id": c.Params("id")})
}

// --- Cost ---
func GetCurrentCost(c *fiber.Ctx) error {
	agent := fiber.Get(fmt.Sprintf("%s/api/v1/cost/current", getAIServiceURL()))
	statusCode, body, errs := agent.Bytes()
	if len(errs) > 0 {
		return c.JSON(fiber.Map{"mtd_spend": 49600.0, "mtd_savings": 18400.0})
	}
	c.Status(statusCode)
	return c.Send(body)
}

func GetCostForecast(c *fiber.Ctx) error {
	agent := fiber.Get(fmt.Sprintf("%s/api/v1/cost/forecast", getAIServiceURL()))
	statusCode, body, errs := agent.Bytes()
	if len(errs) > 0 {
		return c.JSON(fiber.Map{
			"projected_cost": 52000.0,
			"savings_potential": 18800.0,
		})
	}
	c.Status(statusCode)
	return c.Send(body)
}

func GetCostBreakdown(c *fiber.Ctx) error {
	agent := fiber.Get(fmt.Sprintf("%s/api/v1/cost/breakdown", getAIServiceURL()))
	statusCode, body, errs := agent.Bytes()
	if len(errs) > 0 {
		return c.JSON([]fiber.Map{
			{"service": "Compute", "cost": 28400},
			{"service": "Storage", "cost": 4200},
		})
	}
	c.Status(statusCode)
	return c.Send(body)
}

func GetSavingsHistory(c *fiber.Ctx) error {
	agent := fiber.Get(fmt.Sprintf("%s/api/v1/cost/savings", getAIServiceURL()))
	statusCode, body, errs := agent.Bytes()
	if len(errs) > 0 {
		return c.JSON([]fiber.Map{
			{"month": "Jun", "savings": 31200},
			{"month": "Jul", "savings": 38900},
		})
	}
	c.Status(statusCode)
	return c.Send(body)
}

// --- Failure Predictions ---
func GetFailurePredictions(c *fiber.Ctx) error {
	agent := fiber.Get(fmt.Sprintf("%s/api/v1/failure/?cluster_id=prod-us-east-1", getAIServiceURL()))
	statusCode, body, errs := agent.Bytes()
	if len(errs) > 0 {
		return c.JSON([]fiber.Map{
			{"id": "fp-1", "node": "node-1", "type": "OOM", "probability": 94, "eta": "12m"},
		})
	}
	c.Status(statusCode)
	return c.Send(body)
}

func AcknowledgeFailure(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "acknowledged", "id": c.Params("id")})
}

// --- Policies ---
func ListPolicies(c *fiber.Ctx) error {
	return c.JSON([]fiber.Map{
		{"id": "pol-1", "name": "production-policy", "mode": "autonomous", "enabled": true},
	})
}

func GetPolicy(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"id": c.Params("id"), "name": "production-policy", "mode": "autonomous"})
}

func CreatePolicy(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "created", "id": "pol-2"})
}

func UpdatePolicy(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "updated", "id": c.Params("id")})
}

func DeletePolicy(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "deleted", "id": c.Params("id")})
}

// --- AI Explain ---
func ExplainRecommendation(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"recommendation_id": c.Params("recommendationID"),
		"explanation":       "Calculated via SHAP values showing high CPU request sizing over-provisioning.",
	})
}

// --- Audit Log ---
func GetAuditLog(c *fiber.Ctx) error {
	return c.JSON([]fiber.Map{
		{"time": "4m ago", "event": "In-place CPU resize applied", "user": "admin"},
	})
}
