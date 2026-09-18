from typing import List, Optional
from pydantic import BaseModel, Field


class FactorContribution(BaseModel):
    name: str
    value: float
    contribution_pct: float = Field(..., description="Estimated percentage contribution to the score")


class RiskPredictRequest(BaseModel):
    """Input parameters for rule-based transparent landslide risk calculation."""
    rainfall: float = Field(..., ge=0.0, le=1000.0, description="24h cumulative rainfall in mm")
    soil_saturation: float = Field(..., ge=0.0, le=100.0, description="Current soil saturation percentage (0-100)")
    slope: float = Field(..., ge=0.0, le=90.0, description="Slope inclination in degrees (0-90)")
    seismic_activity: float = Field(..., ge=0.0, le=100.0, description="Seismic vibration / shake index (0-100)")
    vegetation_cover: Optional[float] = Field(50.0, ge=0.0, le=100.0, description="Vegetation cover percentage (0-100)")


class RiskPredictResponse(BaseModel):
    """Output risk prediction with factor breakdown."""
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Calculated risk score between 0.00 and 1.00")
    risk_level: str = Field(..., description="Classified risk tier: LOW, MODERATE, HIGH, CRITICAL")
    factors: List[FactorContribution] = Field(..., description="Decomposed factor contributions")
    recommendation: str = Field(..., description="Operational advisory recommendation")
