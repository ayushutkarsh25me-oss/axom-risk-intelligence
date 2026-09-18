from fastapi import APIRouter
from app.schemas.risk import RiskPredictRequest, RiskPredictResponse
from app.services.risk_service import risk_service

router = APIRouter(prefix="/risk", tags=["Risk Calculation"])


@router.post("/predict", response_model=RiskPredictResponse)
def predict_risk(payload: RiskPredictRequest):
    """
    Calculate real-time landslide risk score and factor decomposition
    using the transparent multi-criteria assessment model.
    """
    return risk_service.calculate_risk(payload)
