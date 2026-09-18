from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import List, Optional
from uuid import uuid4

from app.database.supabase_client import get_supabase_client
from app.schemas.alerts import AlertItem, AlertsListResponse
from app.schemas.dispatch import DispatchResult
from app.services.dispatchers import dispatcher_hub

logger = logging.getLogger("axom.services.alerts")

DEMO_ALERTS: List[dict] = [
    {
        "id": "alert-01",
        "location_id": "east-khasi-hills",
        "location_name": "East Khasi Hills",
        "severity": "critical",
        "risk_score": 0.82,
        "message": "Immediate evacuation advisory",
        "status": "active",
        "created_at": "10:42 PM",
    },
    {
        "id": "alert-02",
        "location_id": "aizawl",
        "location_name": "Aizawl",
        "severity": "high",
        "risk_score": 0.68,
        "message": "Enhanced monitoring recommended",
        "status": "active",
        "created_at": "10:37 PM",
    },
    {
        "id": "alert-03",
        "location_id": "gangtok",
        "location_name": "Gangtok",
        "severity": "high",
        "risk_score": 0.64,
        "message": "Inspect NH-10 landslide-prone stretches",
        "status": "active",
        "created_at": "10:33 PM",
    },
    {
        "id": "alert-04",
        "location_id": "kohima",
        "location_name": "Kohima",
        "severity": "moderate",
        "risk_score": 0.46,
        "message": "Continue monitoring",
        "status": "active",
        "created_at": "10:30 PM",
    },
    {
        "id": "alert-05",
        "location_id": "itanagar",
        "location_name": "Itanagar",
        "severity": "high",
        "risk_score": 0.61,
        "message": "Advisory to communities near cut slopes",
        "status": "active",
        "created_at": "10:24 PM",
    },
    {
        "id": "alert-06",
        "location_id": "shillong",
        "location_name": "Shillong",
        "severity": "moderate",
        "risk_score": 0.44,
        "message": "Watch rainfall accumulation",
        "status": "acknowledged",
        "created_at": "10:19 PM",
    },
    {
        "id": "alert-07",
        "location_id": "guwahati",
        "location_name": "Guwahati",
        "severity": "moderate",
        "risk_score": 0.41,
        "message": "Localized hillside-colony risk",
        "status": "acknowledged",
        "created_at": "10:11 PM",
    },
    {
        "id": "alert-08",
        "location_id": "east-khasi-hills",
        "location_name": "East Khasi Hills",
        "severity": "critical",
        "risk_score": 0.79,
        "message": "Soil saturation threshold exceeded",
        "status": "active",
        "created_at": "09:58 PM",
    },
]


class AlertService:
    """In-memory alerts with optional Supabase persistence and demo dispatch audit."""

    def __init__(self):
        self._alerts = [dict(a) for a in DEMO_ALERTS]
        self._dispatches: List[dict] = []

    def get_alerts(self) -> AlertsListResponse:
        rows = self._load_supabase_alerts() or self._alerts
        items = [AlertItem(**a) for a in rows]
        active_count = sum(1 for a in items if a.status == "active")
        return AlertsListResponse(total=len(items), active_count=active_count, alerts=items)

    def get_dispatches(self, alert_id: Optional[str] = None) -> List[dict]:
        items = self._dispatches
        if alert_id:
            items = [d for d in items if d.get("alert_id") == alert_id]
        return items

    def acknowledge_alert(self, alert_id: str) -> Optional[AlertItem]:
        for alert in self._alerts:
            if alert["id"] == alert_id:
                alert["status"] = "acknowledged"
                self._persist_alert_status(alert_id, "acknowledged")
                return AlertItem(**alert)
        remote = self._load_supabase_alerts()
        if remote:
            match = next((a for a in remote if a["id"] == alert_id), None)
            if match:
                match["status"] = "acknowledged"
                self._persist_alert_status(alert_id, "acknowledged")
                return AlertItem(**match)
        return None

    def acknowledge_for_location(self, location_id: str) -> int:
        count = 0
        for alert in self._alerts:
            if alert["location_id"] == location_id and alert["status"] == "active":
                alert["status"] = "acknowledged"
                self._persist_alert_status(alert["id"], "acknowledged")
                count += 1
        return count

    def issue_alert(
        self,
        *,
        location_id: str,
        location_name: str,
        severity: str,
        risk_score: float,
        message: str,
        channels: dict,
    ) -> tuple[AlertItem, List[DispatchResult]]:
        alert = {
            "id": f"alert-{uuid4().hex[:8]}",
            "location_id": location_id,
            "location_name": location_name,
            "severity": severity.lower(),
            "risk_score": risk_score,
            "message": message,
            "status": "active",
            "created_at": datetime.now(timezone.utc).strftime("%H:%M UTC"),
        }
        self._alerts.insert(0, alert)
        self._persist_new_alert(alert)
        results = dispatcher_hub.dispatch_alert(alert, channels)
        for result in results:
            self._record_dispatch(alert["id"], result)
        return AlertItem(**alert), results

    def maybe_create_threshold_alert(self, loc: dict, high: float, critical: float, channels: dict) -> bool:
        score = float(loc.get("risk_score", 0))
        if score < high:
            return False
        severity = "critical" if score >= critical else "high"
        open_same = any(
            a["location_id"] == loc["id"]
            and a["status"] == "active"
            and a["severity"] == severity
            for a in self._alerts
        )
        if open_same:
            return False
        message = loc.get("recommendation") or f"{severity.title()} risk threshold exceeded"
        self.issue_alert(
            location_id=loc["id"],
            location_name=loc["name"],
            severity=severity,
            risk_score=score,
            message=message,
            channels=channels,
        )
        return True

    def queue_report(self, loc: dict) -> DispatchResult:
        payload = {
            "location_name": loc["name"],
            "severity": str(loc.get("risk_level", "low")).lower(),
            "risk_score": loc.get("risk_score"),
        }
        result = dispatcher_hub.queue_report(payload)
        self._record_dispatch(None, result)
        return result

    def _record_dispatch(self, alert_id: Optional[str], result: DispatchResult) -> None:
        row = {
            "alert_id": alert_id,
            "channel": result.channel,
            "status": result.status,
            "detail": result.detail,
            "created_at": result.created_at,
        }
        self._dispatches.append(row)
        client = get_supabase_client()
        if not client:
            return
        try:
            client.table("alert_dispatches").insert(
                {
                    "alert_id": alert_id,
                    "channel": result.channel,
                    "status": result.status,
                    "detail": result.detail,
                }
            ).execute()
        except Exception as exc:
            logger.warning("Could not persist dispatch audit (%s)", exc)

    def _persist_new_alert(self, alert: dict) -> None:
        client = get_supabase_client()
        if not client:
            return
        try:
            client.table("alerts").insert(
                {
                    "id": alert["id"],
                    "location_id": alert["location_id"],
                    "severity": alert["severity"],
                    "risk_score": alert["risk_score"],
                    "message": alert["message"],
                    "status": alert["status"],
                }
            ).execute()
        except Exception as exc:
            logger.warning("Could not persist alert (%s)", exc)

    def _persist_alert_status(self, alert_id: str, status: str) -> None:
        client = get_supabase_client()
        if not client:
            return
        try:
            patch = {"status": status}
            if status == "acknowledged":
                patch["acknowledged_at"] = datetime.now(timezone.utc).isoformat()
            client.table("alerts").update(patch).eq("id", alert_id).execute()
        except Exception as exc:
            logger.warning("Could not update alert status (%s)", exc)

    def _load_supabase_alerts(self) -> Optional[List[dict]]:
        client = get_supabase_client()
        if not client:
            return None
        try:
            res = client.table("alerts").select("*").order("created_at", desc=True).execute()
            rows = res.data or []
            if not rows:
                return None
            mapped = []
            for row in rows:
                mapped.append(
                    {
                        "id": row["id"],
                        "location_id": row["location_id"],
                        "location_name": row.get("location_name") or row["location_id"],
                        "severity": row["severity"],
                        "risk_score": row["risk_score"],
                        "message": row["message"],
                        "status": row["status"],
                        "created_at": str(row.get("created_at") or ""),
                    }
                )
            return mapped
        except Exception as exc:
            logger.warning("Failed to query Supabase alerts (%s). Using demo alerts.", exc)
            return None


alert_service = AlertService()
