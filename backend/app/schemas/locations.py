from typing import List, Optional
from pydantic import BaseModel, Field


class LocationSummary(BaseModel):
    """Monitored site summary schema."""
    id: str = Field(..., description="Unique identifier for the location")
    name: str = Field(..., description="Site or town name")
    state: str = Field(..., description="State in North Eastern Region")
    district: str = Field(..., description="Administrative district")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude coordinate")
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Calculated risk score between 0.0 and 1.0")
    risk_level: str = Field(..., description="Classified risk level: LOW, MODERATE, HIGH, CRITICAL")
    rainfall: float = Field(..., ge=0.0, description="24h cumulative rainfall in mm")
    soil_saturation: float = Field(..., ge=0.0, le=100.0, description="Soil saturation percentage")
    slope: float = Field(..., ge=0.0, le=90.0, description="Terrain slope in degrees")
    seismic_activity: str = Field(..., description="Seismic activity classification or index")
    last_updated: str = Field(..., description="Timestamp of the latest reading")


class LocationDetail(LocationSummary):
    """Detailed site assessment schema."""
    confidence: float = Field(0.85, ge=0.0, le=1.0, description="Model prediction confidence score")
    vegetation: float = Field(50.0, ge=0.0, le=100.0, description="Vegetation cover percentage")
    recommendation: str = Field("", description="Early warning actionable advisory")
    trend_delta: float = Field(0.0, description="Score difference compared to previous cycle")
    history: List[float] = Field(default_factory=list, description="Hourly risk score history for the last 24h")


class LocationsListResponse(BaseModel):
    total: int
    locations: List[LocationSummary]
