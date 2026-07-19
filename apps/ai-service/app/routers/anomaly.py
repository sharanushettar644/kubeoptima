from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter()

class AnomalyEvent(BaseModel):
    id: str
    workload: str
    namespace: str
    metric: str
    anomaly_score: float
    detected_at: datetime
    description: str

@router.get("/events", response_model=List[AnomalyEvent])
async def get_anomaly_events():
    return [
        AnomalyEvent(
            id="anom-1",
            workload="payment-gateway",
            namespace="production",
            metric="network_out",
            anomaly_score=0.91,
            detected_at=datetime.utcnow(),
            description="Unexpected outbound traffic spike of 4.2 Gbps (normal bounds: 100-300 Mbps)."
        ),
        AnomalyEvent(
            id="anom-2",
            workload="db-replicator",
            namespace="kube-system",
            metric="cpu",
            anomaly_score=0.84,
            detected_at=datetime.utcnow(),
            description="CPU saturation anomaly detected at 98% utilization with flatlined load average."
        )
    ]
