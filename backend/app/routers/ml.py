from fastapi import APIRouter, HTTPException
from app.schemas.ml import MLPredictRequest, MLPredictResponse
from app.ml.model import ml_model

router = APIRouter(prefix="/ml", tags=["Machine Learning"])


@router.post("/predict", response_model=MLPredictResponse)
def predict_ml_risk(payload: MLPredictRequest):
    """
    Run landslide classification using the persisted Random Forest.
    Synthetic baseline is used only when no artifact exists yet.
    """
    veg = payload.vegetation_cover if payload.vegetation_cover is not None else 50.0
    try:
        result = ml_model.predict(
            rainfall=payload.rainfall,
            soil_saturation=payload.soil_saturation,
            slope=payload.slope,
            seismic_activity=payload.seismic_activity,
            vegetation_cover=veg,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"ML inference failed: {exc}") from exc
    return MLPredictResponse(**result)
