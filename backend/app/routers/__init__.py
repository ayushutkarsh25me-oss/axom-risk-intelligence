from .health import router as health_router
from .locations import router as locations_router
from .risk import router as risk_router
from .ml import router as ml_router
from .alerts import router as alerts_router
from .analytics import router as analytics_router
from .auth import router as auth_router
from .settings import router as settings_router
from .ingest import router as ingest_router

__all__ = [
    "health_router",
    "locations_router",
    "risk_router",
    "ml_router",
    "alerts_router",
    "analytics_router",
    "auth_router",
    "settings_router",
    "ingest_router",
]
