from typing import List, Optional
from pydantic import BaseModel, Field


class AlertItem(BaseModel):
    """Alert record schema."""
    id: str = Field(..., description="Unique alert identifier")
    location_id: str = Field(..., description="Reference ID to the monitored location")
    location_name: str = Field(..., description="Display name of the site")
    severity: str = Field(..., description="Severity level: low, moderate, high, critical")
    risk_score: float = Field(..., description="Risk score at the time of alert trigger")
    message: str = Field(..., description="Advisory or warning description")
    status: str = Field(..., description="Current status: active, acknowledged")
    created_at: str = Field(..., description="Formatted timestamp or ISO date")


class AlertsListResponse(BaseModel):
    total: int
    active_count: int
    alerts: List[AlertItem]


class AlertAcknowledgeResponse(BaseModel):
    success: bool
    message: str
    alert: AlertItem
