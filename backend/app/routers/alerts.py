from typing import List, Optional

from fastapi import APIRouter, HTTPException, Path, Query

from app.schemas.alerts import AlertItem, AlertAcknowledgeResponse
from app.schemas.dispatch import IssueAlertRequest, IssueAlertResponse, ReportRequest, ReportResponse
from app.services.alert_service import alert_service
from app.services.data_service import data_service
from app.services.settings_service import settings_service

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=List[AlertItem])
def get_alerts():
    return alert_service.get_alerts().alerts


@router.get("/audit")
def get_dispatch_audit(alert_id: Optional[str] = Query(default=None)):
    return {"dispatches": alert_service.get_dispatches(alert_id)}


@router.post("/{alert_id}/acknowledge", response_model=AlertAcknowledgeResponse)
def acknowledge_alert(
    alert_id: str = Path(..., description="Unique ID of the alert to acknowledge")
):
    updated = alert_service.acknowledge_alert(alert_id)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Alert with ID '{alert_id}' not found.")
    return AlertAcknowledgeResponse(
        success=True,
        message=f"Alert '{alert_id}' acknowledged successfully.",
        alert=updated,
    )


@router.post("/issue", response_model=IssueAlertResponse)
def issue_alert(payload: IssueAlertRequest):
    loc = data_service.get_location_detail(payload.location_id)
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location '{payload.location_id}' not found.")
    channels = settings_service.channels().model_dump()
    message = payload.message or loc.recommendation or "Operator-issued advisory"
    alert, dispatches = alert_service.issue_alert(
        location_id=loc.id,
        location_name=loc.name,
        severity=loc.risk_level,
        risk_score=loc.risk_score,
        message=message,
        channels=channels,
    )
    return IssueAlertResponse(success=True, alert=alert.model_dump(), dispatches=dispatches)


@router.post("/report", response_model=ReportResponse)
def queue_report(payload: ReportRequest):
    loc = data_service.get_location_detail(payload.location_id)
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location '{payload.location_id}' not found.")
    dispatch = alert_service.queue_report(loc.model_dump())
    return ReportResponse(
        success=True,
        location_id=loc.id,
        location_name=loc.name,
        dispatch=dispatch,
        note="Demo dispatcher recorded an audit row. No external PDF was sent.",
    )
