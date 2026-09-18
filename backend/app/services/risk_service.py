from typing import List
from app.schemas.risk import RiskPredictRequest, RiskPredictResponse, FactorContribution


def classify_risk_tier(score: float) -> str:
    if score >= 0.80:
        return "CRITICAL"
    if score >= 0.60:
        return "HIGH"
    if score >= 0.40:
        return "MODERATE"
    return "LOW"


def generate_recommendation(risk_tier: str) -> str:
    if risk_tier == "CRITICAL":
        return "Immediate evacuation advisory. Avoid slope-side roads, inspect drainage barriers, and alert NDRF/SDRF response teams."
    elif risk_tier == "HIGH":
        return "Enhanced monitoring recommended. Pre-position quick-response machinery and restrict heavy commercial transit along vulnerable corridors."
    elif risk_tier == "MODERATE":
        return "Continue monitoring. Track rainfall accumulation trends over the next 12 hours and conduct visual slope surveillance."
    return "No action required. Geological and meteorological conditions remain stable within baseline thresholds."


class RiskService:
    """Transparent heuristic risk assessment service for early-warning calculations."""

    @staticmethod
    def calculate_risk(req: RiskPredictRequest) -> RiskPredictResponse:
        # Normalized feature values
        rainfall_norm = min(1.0, req.rainfall / 300.0)
        soil_norm = min(1.0, req.soil_saturation / 100.0)
        slope_norm = min(1.0, req.slope / 60.0)
        seismic_norm = min(1.0, req.seismic_activity / 100.0)
        veg_cover = req.vegetation_cover if req.vegetation_cover is not None else 50.0
        veg_norm = min(1.0, veg_cover / 100.0)

        # Multi-criteria weighted scoring
        weighted = (
            rainfall_norm * 0.34 +
            soil_norm * 0.28 +
            slope_norm * 0.22 +
            seismic_norm * 0.16 -
            veg_norm * 0.12
        )

        score = max(0.02, min(0.98, weighted + 0.06))
        score = round(score, 2)
        tier = classify_risk_tier(score)

        factors: List[FactorContribution] = [
            FactorContribution(name="Rainfall", value=round(req.rainfall, 1), contribution_pct=round(rainfall_norm * 100, 1)),
            FactorContribution(name="Soil Saturation", value=round(req.soil_saturation, 1), contribution_pct=round(soil_norm * 100, 1)),
            FactorContribution(name="Slope", value=round(req.slope, 1), contribution_pct=round(slope_norm * 100, 1)),
            FactorContribution(name="Seismic Activity", value=round(req.seismic_activity, 1), contribution_pct=round(seismic_norm * 100, 1)),
            FactorContribution(name="Vegetation Cover", value=round(veg_cover, 1), contribution_pct=round(veg_norm * 100, 1)),
        ]

        return RiskPredictResponse(
            risk_score=score,
            risk_level=tier,
            factors=factors,
            recommendation=generate_recommendation(tier),
        )


risk_service = RiskService()
