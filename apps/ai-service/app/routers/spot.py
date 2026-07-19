from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class SpotRecommendation(BaseModel):
    instance_type: str
    availability_zone: str
    interruption_probability: float
    confidence: float
    price_trend: str
    current_spot_price_usd: float
    on_demand_price_usd: float
    saving_percent: float
    safe_to_migrate: bool

@router.get("/predictions", response_model=List[SpotRecommendation])
async def get_spot_predictions():
    return [
        SpotRecommendation(
            instance_type="c5.2xlarge",
            availability_zone="us-east-1a",
            interruption_probability=0.07,
            confidence=0.92,
            price_trend="stable",
            current_spot_price_usd=0.085,
            on_demand_price_usd=0.34,
            saving_percent=75.0,
            safe_to_migrate=True
        ),
        SpotRecommendation(
            instance_type="m5.xlarge",
            availability_zone="us-east-1b",
            interruption_probability=0.12,
            confidence=0.88,
            price_trend="rising",
            current_spot_price_usd=0.058,
            on_demand_price_usd=0.192,
            saving_percent=69.8,
            safe_to_migrate=True
        ),
        SpotRecommendation(
            instance_type="r5.4xlarge",
            availability_zone="us-east-1c",
            interruption_probability=0.18,
            confidence=0.85,
            price_trend="volatile",
            current_spot_price_usd=0.294,
            on_demand_price_usd=1.008,
            saving_percent=70.8,
            safe_to_migrate=False
        )
    ]
