from typing import List, Dict, Any
from pydantic import BaseModel, Field


class RiskTrendPoint(BaseModel):
    time: str
    average: float
    peak: float


class FactorWeightItem(BaseModel):
    name: str
    value: float


class ModelStatItem(BaseModel):
    label: str
    value: str
    note: str


class AnalyticsSummaryResponse(BaseModel):
    """Fleet-wide analytics metrics and visualization data."""
    monitored_sites: int = Field(..., description="Total number of monitored sites")
    low_risk_sites: int = Field(..., description="Sites currently in LOW risk tier")
    moderate_risk_sites: int = Field(..., description="Sites currently in MODERATE risk tier")
    high_risk_sites: int = Field(..., description="Sites currently in HIGH risk tier")
    critical_risk_sites: int = Field(..., description="Sites currently in CRITICAL risk tier")
    active_alerts: int = Field(..., description="Number of unacknowledged active alerts")
    instrumented_sites: int = Field(..., description="Sites with current environmental readings")
    data_mode: str = Field("demo", description="demo | supabase")
    simulated: bool = True
    last_updated: str
    next_update: str
    risk_trend_24h: List[RiskTrendPoint] = Field(..., description="Hourly fleet peak vs average scores")
    environmental_factors: List[FactorWeightItem] = Field(..., description="Fleet-wide factor intensity weights")
    model_stats: List[ModelStatItem] = Field(..., description="ML operational statistics")
