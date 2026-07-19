from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional
import numpy as np

router = APIRouter()

class PodRightsizingRecommendation(BaseModel):
    name: str
    namespace: str
    cpu: int
    recommended_cpu: int
    mem: int
    recommended_mem: int
    saving: float
    confidence: float

class NodeRightsizingRecommendation(BaseModel):
    current: str
    recommended: str
    saving: str
    confidence: float

@router.get("/pods", response_model=List[PodRightsizingRecommendation])
async def list_pod_rightsizing(cluster_id: Optional[str] = "prod-us-east-1"):
    return [
        PodRightsizingRecommendation(
            name="api-server",
            namespace="production",
            cpu=800,
            recommended_cpu=250,
            mem=1024,
            recommended_mem=400,
            saving=284.0,
            confidence=0.94,
        ),
        PodRightsizingRecommendation(
            name="batch-workers",
            namespace="processing",
            cpu=1600,
            recommended_cpu=600,
            mem=2048,
            recommended_mem=1024,
            saving=512.0,
            confidence=0.88,
        ),
        PodRightsizingRecommendation(
            name="payment-processor",
            namespace="production",
            cpu=400,
            recommended_cpu=200,
            mem=512,
            recommended_mem=256,
            saving=145.0,
            confidence=0.91,
        )
    ]

@router.get("/nodes", response_model=List[NodeRightsizingRecommendation])
async def list_node_rightsizing(cluster_id: Optional[str] = "prod-us-east-1"):
    return [
        NodeRightsizingRecommendation(
            current="m5.4xlarge",
            recommended="c7g.2xlarge",
            saving="$340/mo",
            confidence=0.92,
        ),
        NodeRightsizingRecommendation(
            current="t3.medium",
            recommended="t3.small",
            saving="$45/mo",
            confidence=0.87,
        )
    ]
