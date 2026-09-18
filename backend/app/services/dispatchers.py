"""Alert channel dispatchers. Without credentials they log demo deliveries only."""

from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import List

from app.schemas.dispatch import DispatchResult


class AlertDispatcher(ABC):
    channel: str

    @abstractmethod
    def dispatch(self, *, alert: dict, enabled: bool) -> DispatchResult:
        ...


class DemoChannelDispatcher(AlertDispatcher):
    def __init__(self, channel: str, requires_credentials: bool = True):
        self.channel = channel
        self.requires_credentials = requires_credentials

    def dispatch(self, *, alert: dict, enabled: bool) -> DispatchResult:
        if not enabled:
            return DispatchResult(
                channel=self.channel,
                status="skipped",
                detail=f"{self.channel.upper()} channel disabled in settings.",
                created_at=_now(),
            )
        return DispatchResult(
            channel=self.channel,
            status="demo_logged",
            detail=(
                f"{self.channel.upper()} was not sent to a real provider. "
                f"Demo audit recorded for {alert.get('location_name')} "
                f"({alert.get('severity')} / score {alert.get('risk_score')})."
            ),
            created_at=_now(),
        )


class ReportDispatcher(AlertDispatcher):
    channel = "pdf"

    def dispatch(self, *, alert: dict, enabled: bool = True) -> DispatchResult:
        return DispatchResult(
            channel="pdf",
            status="demo_logged",
            detail=(
                f"Situation report for {alert.get('location_name')} queued in demo mode. "
                "No PDF file was emailed or stored externally."
            ),
            created_at=_now(),
        )


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class DispatcherHub:
    def __init__(self) -> None:
        self.sms = DemoChannelDispatcher("sms")
        self.email = DemoChannelDispatcher("email")
        self.push = DemoChannelDispatcher("push")
        self.pdf = ReportDispatcher()

    def dispatch_alert(self, alert: dict, channels: dict) -> List[DispatchResult]:
        results = [
            self.sms.dispatch(alert=alert, enabled=bool(channels.get("sms", False))),
            self.email.dispatch(alert=alert, enabled=bool(channels.get("email", False))),
            self.push.dispatch(alert=alert, enabled=bool(channels.get("push", False))),
        ]
        return results

    def queue_report(self, alert: dict) -> DispatchResult:
        return self.pdf.dispatch(alert=alert)


dispatcher_hub = DispatcherHub()
