from fastapi import APIRouter, Depends

from app.auth import Principal, get_principal
from app.config import settings
from app.database.supabase_client import is_supabase_configured
from app.ml.model import ml_model
from app.providers import provider_registry
from app.scheduler.ingest import last_run

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check(principal: Principal = Depends(get_principal)):
    """Health check including storage, auth, and provider mode."""
    ml_model.ensure_ready()
    return {
        "status": "ok",
        "service": "AXOM Backend",
        "version": settings.VERSION,
        "database_mode": "supabase" if is_supabase_configured() else "demo",
        "auth_enabled": settings.AUTH_ENABLED,
        "auth_mode": "required" if settings.AUTH_ENABLED else "demo_bypass",
        "operator": principal.email,
        "scheduler_enabled": settings.ENABLE_SCHEDULER,
        "last_ingest": last_run(),
        "ml_ready": ml_model.is_trained,
        "ml_training_source": ml_model.training_source,
        "providers": [
            {"id": p.id, "name": p.name, "mode": p.mode, "message": p.message}
            for p in provider_registry.statuses()
            if p.id in {"imd", "isro-bhuvan", "gsi-bhukosh", "cwc"}
        ],
    }
