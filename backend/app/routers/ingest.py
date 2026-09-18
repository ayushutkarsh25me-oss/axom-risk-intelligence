from fastapi import APIRouter

from app.config import settings
from app.providers import provider_registry
from app.scheduler.ingest import last_run, run_ingestion_cycle
from app.schemas.ingest import IngestRunResponse, SchedulerStatusResponse
from app.schemas.providers import DataSourcesResponse

router = APIRouter(tags=["Ingest & Data Sources"])


@router.get("/data-sources", response_model=DataSourcesResponse)
def get_data_sources():
    return DataSourcesResponse(active_mode="demo", providers=provider_registry.statuses())


@router.post("/ingest/run", response_model=IngestRunResponse)
def trigger_ingest():
    """Manual ingest. Does not require the background scheduler."""
    return run_ingestion_cycle()


@router.get("/ingest/status", response_model=SchedulerStatusResponse)
def ingest_status():
    return SchedulerStatusResponse(
        enabled=settings.ENABLE_SCHEDULER,
        interval_minutes=settings.INGEST_INTERVAL_MINUTES,
        last_run=last_run(),
        next_run_hint=(
            f"Every {settings.INGEST_INTERVAL_MINUTES} minutes when ENABLE_SCHEDULER=true; "
            "otherwise call POST /api/ingest/run."
        ),
    )
