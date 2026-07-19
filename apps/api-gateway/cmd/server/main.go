package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"

	"kubeoptima/api-gateway/internal/handlers"
	"kubeoptima/api-gateway/internal/middleware"
)

func main() {
	app := fiber.New(fiber.Config{
		AppName:       "KubeOptima API Gateway v1.0",
		ErrorHandler:  errorHandler,
		ReadTimeout:   30 * time.Second,
		WriteTimeout:  30 * time.Second,
		BodyLimit:     4 * 1024 * 1024, // 4MB
	})

	// Global middleware
	app.Use(recover.New())
	app.Use(requestid.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} ${method} ${path} ${latency} | ${ip} | ${locals:requestid}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: os.Getenv("ALLOWED_ORIGINS"),
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
	}))

	// Auth middleware (OIDC/JWT)
	app.Use(middleware.OIDC())

	// Health check (public)
	app.Get("/healthz", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "time": time.Now().UTC()})
	})
	app.Get("/readyz", handlers.ReadinessHandler)

	// --- API v1 ---
	v1 := app.Group("/api/v1")

	// Clusters
	clusters := v1.Group("/clusters")
	clusters.Get("/", handlers.ListClusters)
	clusters.Get("/:clusterID", handlers.GetCluster)
	clusters.Get("/:clusterID/nodes", handlers.ListNodes)
	clusters.Get("/:clusterID/pods", handlers.ListPods)
	clusters.Get("/:clusterID/metrics", handlers.GetClusterMetrics)
	clusters.Get("/:clusterID/health", handlers.GetClusterHealth)

	// Recommendations
	recs := v1.Group("/recommendations")
	recs.Get("/", handlers.ListRecommendations)
	recs.Get("/:id", handlers.GetRecommendation)
	recs.Post("/:id/apply", handlers.ApplyRecommendation)
	recs.Post("/:id/dismiss", handlers.DismissRecommendation)
	recs.Post("/:id/schedule", handlers.ScheduleRecommendation)

	// Rightsizing
	rs := v1.Group("/rightsizing")
	rs.Get("/pods", handlers.ListPodRightsizing)
	rs.Get("/nodes", handlers.ListNodeRightsizing)
	rs.Post("/pods/:namespace/:name/apply", handlers.ApplyPodRightsizing)
	rs.Post("/nodes/:name/migrate", handlers.MigrateNode)

	// Autoscaling
	as := v1.Group("/autoscaling")
	as.Get("/forecast", handlers.GetScalingForecast)
	as.Get("/events", handlers.GetScalingEvents)
	as.Post("/override", handlers.OverrideScaling)

	// Migrations
	migs := v1.Group("/migrations")
	migs.Get("/", handlers.ListMigrations)
	migs.Get("/:id", handlers.GetMigration)
	migs.Post("/", handlers.CreateMigration)
	migs.Delete("/:id", handlers.CancelMigration)

	// Cost
	cost := v1.Group("/costs")
	cost.Get("/current", handlers.GetCurrentCost)
	cost.Get("/forecast", handlers.GetCostForecast)
	cost.Get("/breakdown", handlers.GetCostBreakdown)
	cost.Get("/savings", handlers.GetSavingsHistory)

	// Failures
	fail := v1.Group("/failures")
	fail.Get("/predictions", handlers.GetFailurePredictions)
	fail.Post("/:id/acknowledge", handlers.AcknowledgeFailure)

	// Policies
	pol := v1.Group("/policies")
	pol.Get("/", handlers.ListPolicies)
	pol.Get("/:id", handlers.GetPolicy)
	pol.Post("/", handlers.CreatePolicy)
	pol.Put("/:id", handlers.UpdatePolicy)
	pol.Delete("/:id", handlers.DeletePolicy)

	// AI Explain
	v1.Get("/explain/:recommendationID", handlers.ExplainRecommendation)

	// Audit log
	v1.Get("/audit", handlers.GetAuditLog)

	// Start server with graceful shutdown
	port := os.Getenv("PORT")
	if port == "" {
		port = "9090"
	}

	go func() {
		log.Printf("🚀 KubeOptima API Gateway listening on :%s", port)
		if err := app.Listen(":" + port); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	log.Println("Shutting down API Gateway...")
	if err := app.ShutdownWithContext(ctx); err != nil {
		log.Printf("Force shutdown: %v", err)
	}
	log.Println("API Gateway stopped.")
}

func errorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}
	return c.Status(code).JSON(fiber.Map{
		"error":     err.Error(),
		"requestID": c.Locals("requestid"),
		"time":      time.Now().UTC(),
	})
}
