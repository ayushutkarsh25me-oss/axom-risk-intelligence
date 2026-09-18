from typing import List, Optional
from pydantic import BaseModel, Field


class IngestRunResponse(BaseModel):
    success: bool
    mode: str
    updated_locations: int
    alerts_created: int
    message: str
    scheduler_enabled: bool
    interval_minutes: int


class SchedulerStatusResponse(BaseModel):
    enabled: bool
    interval_minutes: int
    last_run: Optional[str] = None
    next_run_hint: str
