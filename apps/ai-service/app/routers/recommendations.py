from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class RecommendationItem(BaseModel):
    id: str
    type: str
    title: str
    namespace: str
    workload_name: str
    impact: str
    saving: str
    confidence: float
    risk_level: str
    explanation: Optional[str] = None

@router.get("/", response_model=List[RecommendationItem])
async def list_recommendations():
    return [
        RecommendationItem(
            id="rec-1",
            type="rightsizing",
            title="Downsize API pods — CPU over-provisioned 4×",
            namespace="production",
            workload_name="api-server",
            impact="high",
            saving="$2,840/mo",
            confidence=0.94,
            risk_level="low",
            explanation="P95 CPU utilization over 30 days is 180m vs requested 800m. Memory P99 at 312Mi vs requested 1Gi. XGBoost model predicts stable usage with 94% confidence."
        ),
        RecommendationItem(
            id="rec-2",
            type="spot",
            title="Migrate stateless workers to Spot",
            namespace="processing",
            workload_name="batch-workers",
            impact="high",
            saving="$5,120/mo",
            confidence=0.88,
            risk_level="medium",
            explanation="Spot interruption probability for c5.2xlarge in us-east-1a is <8% over next 24h. AI model suggests migrating batch workers to save 75% on compute costs."
        ),
        RecommendationItem(
            id="rec-3",
            type="binpack",
            title="Consolidate node pools (AI Bin Packing)",
            namespace="kube-system",
            workload_name="node-groups",
            impact="critical",
            saving="$3,410/mo",
            confidence=0.91,
            risk_level="low",
            explanation="3 nodes averaging <25% CPU and <30% memory. AI bin-packing algorithm recommends consolidating workloads onto 2 nodes, cordoning and draining the third node."
        )
    ]

@router.get("/{rec_id}", response_model=RecommendationItem)
async def get_recommendation(rec_id: str):
    recs = await list_recommendations()
    for r in recs:
        if r.id == rec_id:
            return r
    return r[0]
