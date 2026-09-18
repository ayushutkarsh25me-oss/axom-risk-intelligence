from fastapi import APIRouter
from app.schemas.analytics import AnalyticsSummaryResponse
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary():
    """Retrieve fleet-wide landslide risk metrics, 24h trends, and factor weights."""
    return analytics_service.get_summary()
