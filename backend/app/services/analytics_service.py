from datetime import datetime, timezone
from typing import List

from app.ml.model import ml_model
from app.schemas.analytics import (
    AnalyticsSummaryResponse,
    FactorWeightItem,
    ModelStatItem,
    RiskTrendPoint,
)
from app.services.alert_service import alert_service
from app.services.data_service import data_service, seismic_to_index
from app.services.settings_service import settings_service


def _trend_from_histories(locations: list[dict]) -> List[RiskTrendPoint]:
    histories = [list(loc.get("history") or []) for loc in locations]
    length = max((len(h) for h in histories), default=0)
    if length == 0:
        length = 24
        histories = [[0.3] * 24]
    points: List[RiskTrendPoint] = []
    for i in range(length):
        vals = []
        for hist in histories:
            if i < len(hist):
                vals.append(float(hist[i]))
        if not vals:
            vals = [0.3]
        hour = (i + 23) % 24
        points.append(
            RiskTrendPoint(
                time=f"{str(hour).zfill(2)}:00",
                average=round(sum(vals) / len(vals), 2),
                peak=round(max(vals), 2),
            )
        )
    return points[-24:]


class AnalyticsService:
    @staticmethod
    def get_summary() -> AnalyticsSummaryResponse:
        locations = data_service.get_raw_locations()
        alerts = alert_service.get_alerts()
        app_settings = settings_service.get()

        def _level(loc: dict) -> str:
            return str(loc.get("risk_level", "LOW")).upper()

        low = sum(1 for loc in locations if _level(loc) == "LOW")
        moderate = sum(1 for loc in locations if _level(loc) == "MODERATE")
        high = sum(1 for loc in locations if _level(loc) == "HIGH")
        critical = sum(1 for loc in locations if _level(loc) == "CRITICAL")
        n = max(len(locations), 1)

        env_factors = [
            FactorWeightItem(
                name="Rainfall",
                value=round(sum(float(l.get("rainfall", 0)) for l in locations) / n / 1.5, 1),
            ),
            FactorWeightItem(
                name="Soil Saturation",
                value=round(sum(float(l.get("soil_saturation", 0)) for l in locations) / n, 1),
            ),
            FactorWeightItem(
                name="Slope",
                value=round(sum(float(l.get("slope", 0)) for l in locations) / n / 0.6, 1),
            ),
            FactorWeightItem(
                name="Seismic Activity",
                value=round(sum(seismic_to_index(l.get("seismic_activity")) for l in locations) / n, 1),
            ),
            FactorWeightItem(
                name="Vegetation",
                value=round(sum(float(l.get("vegetation", 50)) for l in locations) / n, 1),
            ),
        ]

        ml_model.ensure_ready()
        model_stats = [
            ModelStatItem(label="Model", value="Random Forest", note=ml_model.training_source),
            ModelStatItem(
                label="Mean Confidence",
                value=f"{round(sum(float(l.get('confidence', 0.8)) for l in locations) / n * 100)}%",
                note="Across instrumented sites",
            ),
            ModelStatItem(label="Features", value="5", note="Rainfall, soil, slope, seismic, vegetation"),
            ModelStatItem(
                label="Refresh",
                value=f"{app_settings.refresh_minutes} min",
                note="Target ingest cadence",
            ),
        ]

        last = datetime.now(timezone.utc).strftime("%H:%M UTC")
        return AnalyticsSummaryResponse(
            monitored_sites=len(locations),
            instrumented_sites=len(locations),
            low_risk_sites=low,
            moderate_risk_sites=moderate,
            high_risk_sites=high,
            critical_risk_sites=critical,
            active_alerts=alerts.active_count,
            data_mode=data_service.storage_mode(),
            simulated=data_service.storage_mode() == "demo",
            last_updated=last,
            next_update=f"{app_settings.refresh_minutes} min cadence",
            risk_trend_24h=_trend_from_histories(locations),
            environmental_factors=env_factors,
            model_stats=model_stats,
        )


analytics_service = AnalyticsService()
