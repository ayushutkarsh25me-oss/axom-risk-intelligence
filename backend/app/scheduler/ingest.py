"""Ingestion cycle. Safe to call from HTTP; scheduler is optional."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Optional

from app.config import settings
from app.providers import provider_registry
from app.schemas.ingest import IngestRunResponse
from app.services.alert_service import alert_service
from app.services.data_service import data_service
from app.services.settings_service import settings_service

logger = logging.getLogger("axom.ingest")

_last_run: Optional[str] = None


def run_ingestion_cycle() -> IngestRunResponse:
    global _last_run
    app_settings = settings_service.get()
    locations = data_service.get_raw_locations()
    updates = provider_registry.fetch_demo_updates(locations)
    changed = data_service.apply_feature_updates(updates)
    created = 0
    for loc in changed:
        if alert_service.maybe_create_threshold_alert(
            loc,
            app_settings.high_threshold,
            app_settings.critical_threshold,
            app_settings.channels.model_dump(),
        ):
            created += 1
    _last_run = datetime.now(timezone.utc).isoformat()
    logger.info("Ingest cycle updated %s sites, created %s alerts", len(changed), created)
    return IngestRunResponse(
        success=True,
        mode="demo_providers",
        updated_locations=len(changed),
        alerts_created=created,
        message=(
            "Demo environmental providers applied a small simulated update. "
            "Live IMD/ISRO/GSI/CWC adapters were not called."
        ),
        scheduler_enabled=settings.ENABLE_SCHEDULER,
        interval_minutes=settings.INGEST_INTERVAL_MINUTES,
    )


def last_run() -> Optional[str]:
    return _last_run
