package controllers

import (
	"context"
	"log/slog"

	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/cache"
	"k8s.io/client-go/util/workqueue"
)

type MigrationJobController struct {
	kubeClient    kubernetes.Interface
	dynamicClient dynamic.Interface
	informer      cache.SharedIndexInformer
	podInformer   cache.SharedIndexInformer
	queue         workqueue.RateLimitingInterface
}

func NewMigrationJobController(
	kubeClient kubernetes.Interface,
	dynamicClient dynamic.Interface,
	informer cache.SharedIndexInformer,
	podInformer cache.SharedIndexInformer,
	queue workqueue.RateLimitingInterface,
) *MigrationJobController {
	return &MigrationJobController{
		kubeClient:    kubeClient,
		dynamicClient: dynamicClient,
		informer:      informer,
		podInformer:   podInformer,
		queue:         queue,
	}
}

func (c *MigrationJobController) Run(ctx context.Context, workers int) {
	defer c.queue.ShutDown()
	slog.Info("Starting MigrationJob controller")
	<-ctx.Done()
	slog.Info("MigrationJob controller stopped")
}
