from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class CostSummary(BaseModel):
    mtd_spend: float
    mtd_savings: float

class CostForecast(BaseModel):
    projected_cost: float
    savings_potential: float

class CostBreakdownItem(BaseModel):
    service: str
    cost: float

class SavingsHistoryItem(BaseModel):
    month: str
    savings: float

@router.get("/current", response_model=CostSummary)
async def get_current_cost():
    return CostSummary(mtd_spend=49600.0, mtd_savings=18400.0)

@router.get("/forecast", response_model=CostForecast)
async def get_cost_forecast():
    return CostForecast(projected_cost=52000.0, savings_potential=18800.0)

@router.get("/breakdown", response_model=List[CostBreakdownItem])
async def get_cost_breakdown():
    return [
        CostBreakdownItem(service="Compute", cost=28400.0),
        CostBreakdownItem(service="Storage", cost=4200.0),
        CostBreakdownItem(service="Network", cost=3100.0),
        CostBreakdownItem(service="Database", cost=8900.0),
        CostBreakdownItem(service="Other", cost=5000.0)
    ]

@router.get("/savings", response_model=List[SavingsHistoryItem])
async def get_savings_history():
    return [
        SavingsHistoryItem(month="Jan", savings=12400.0),
        SavingsHistoryItem(month="Feb", savings=15200.0),
        SavingsHistoryItem(month="Mar", savings=18900.0),
        SavingsHistoryItem(month="Apr", savings=22400.0),
        SavingsHistoryItem(month="May", savings=28600.0),
        SavingsHistoryItem(month="Jun", savings=31200.0),
        SavingsHistoryItem(month="Jul", savings=38900.0)
    ]
