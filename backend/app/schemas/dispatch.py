from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class DispatchResult(BaseModel):
    channel: str
    status: Literal["sent", "demo_logged", "skipped", "failed"]
    detail: str
    created_at: str


class IssueAlertRequest(BaseModel):
    location_id: str = Field(..., min_length=1, max_length=64)
    message: Optional[str] = Field(None, max_length=500)


class IssueAlertResponse(BaseModel):
    success: bool
    alert: dict
    dispatches: List[DispatchResult]


class ReportRequest(BaseModel):
    location_id: str = Field(..., min_length=1, max_length=64)


class ReportResponse(BaseModel):
    success: bool
    location_id: str
    location_name: str
    dispatch: DispatchResult
    note: str
