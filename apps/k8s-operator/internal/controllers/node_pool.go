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

type NodePoolController struct {
	kubeClient    kubernetes.Interface
	dynamicClient dynamic.Interface
	informer      cache.SharedIndexInformer
	nodeInformer  cache.SharedIndexInformer
	queue         workqueue.RateLimitingInterface
}

func NewNodePoolController(
	kubeClient kubernetes.Interface,
	dynamicClient dynamic.Interface,
	informer cache.SharedIndexInformer,
	nodeInformer cache.SharedIndexInformer,
	queue workqueue.RateLimitingInterface,
) *NodePoolController {
	return &NodePoolController{
		kubeClient:    kubeClient,
		dynamicClient: dynamicClient,
		informer:      informer,
		nodeInformer:  nodeInformer,
		queue:         queue,
	}
}

func (c *NodePoolController) Run(ctx context.Context, workers int) {
	defer c.queue.ShutDown()
	slog.Info("Starting NodePool controller")
	<-ctx.Done()
	slog.Info("NodePool controller stopped")
}
