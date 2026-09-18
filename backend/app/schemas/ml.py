from typing import Dict, Optional
from pydantic import BaseModel, Field


class MLPredictRequest(BaseModel):
    """Input features for scikit-learn Random Forest model inference."""
    rainfall: float = Field(..., ge=0.0, le=1000.0, description="24h cumulative rainfall in mm")
    soil_saturation: float = Field(..., ge=0.0, le=100.0, description="Current soil saturation percentage (0-100)")
    slope: float = Field(..., ge=0.0, le=90.0, description="Slope inclination in degrees (0-90)")
    seismic_activity: float = Field(..., ge=0.0, le=100.0, description="Seismic vibration index (0-100)")
    vegetation_cover: Optional[float] = Field(50.0, ge=0.0, le=100.0, description="Vegetation cover percentage (0-100)")


class MLPredictResponse(BaseModel):
    """Output from scikit-learn Random Forest inference."""
    predicted_class: str = Field(..., description="Predicted landslide risk category: LOW, MODERATE, HIGH, CRITICAL")
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Continuous risk index probability score")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model prediction confidence (highest class probability)")
    probabilities: Dict[str, float] = Field(..., description="Probability distribution across all 4 risk classes")
    feature_importances: Dict[str, float] = Field(..., description="Model feature importance weights")
    model_name: str = Field("RandomForestClassifier (Ensemble 100 Trees)", description="ML Architecture")
    model_status: str = Field("prototype_calibrated_baseline", description="Model training maturity status")
    training_source: str = Field(
        "synthetic_gsi_imd_baseline",
        description="synthetic_gsi_imd_baseline | persisted_artifact | field_observations",
    )
    notice: str = Field(
        "Prototype model calibrated against GSI susceptibility thresholds and IMD rainfall intensity baselines. "
        "Suitable for hackathon demonstration; requires empirical field training data for operational deployment.",
        description="Scientific disclosure notice"
    )
