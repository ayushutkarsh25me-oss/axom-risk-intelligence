"""Optional interval loop. Disabled unless ENABLE_SCHEDULER=true."""

from __future__ import annotations

import logging
import threading
from typing import Optional

from app.config import settings
from app.scheduler.ingest import run_ingestion_cycle

logger = logging.getLogger("axom.scheduler")

_timer: Optional[threading.Timer] = None
_started = False


def _tick() -> None:
    global _timer
    try:
        run_ingestion_cycle()
    except Exception as exc:
        logger.warning("Scheduled ingest failed (%s)", exc)
    if settings.ENABLE_SCHEDULER:
        _timer = threading.Timer(settings.INGEST_INTERVAL_MINUTES * 60, _tick)
        _timer.daemon = True
        _timer.start()


def start_scheduler() -> None:
    global _started, _timer
    if not settings.ENABLE_SCHEDULER or _started:
        return
    _started = True
    logger.info(
        "Starting optional ingest scheduler every %s minutes",
        settings.INGEST_INTERVAL_MINUTES,
    )
    _timer = threading.Timer(settings.INGEST_INTERVAL_MINUTES * 60, _tick)
    _timer.daemon = True
    _timer.start()


def stop_scheduler() -> None:
    global _timer, _started
    if _timer:
        _timer.cancel()
        _timer = None
    _started = False
