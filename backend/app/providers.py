"""Pluggable environmental data providers. Live adapters never fake a connection."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from app.config import settings
from app.schemas.providers import ProviderStatus


class EnvironmentalProvider(ABC):
    id: str
    name: str
    provides: str

    @abstractmethod
    def status(self) -> ProviderStatus:
        ...

    @abstractmethod
    def fetch_updates(self, locations: List[dict]) -> Dict[str, Dict[str, Any]]:
        """Return per-location feature patches. Empty dict = no update."""
        ...


class DemoEnvironmentalProvider(EnvironmentalProvider):
    """Deterministic simulator used when live credentials are absent."""

    def __init__(self, provider_id: str, name: str, provides: str, field: str, jitter: float):
        self.id = provider_id
        self.name = name
        self.provides = provides
        self.field = field
        self.jitter = jitter
        self._last_fetch: Optional[str] = None

    def status(self) -> ProviderStatus:
        return ProviderStatus(
            id=self.id,
            name=self.name,
            provides=self.provides,
            mode="demo",
            last_fetch=self._last_fetch,
            message="Simulator active. No live credentials configured.",
        )

    def fetch_updates(self, locations: List[dict]) -> Dict[str, Dict[str, Any]]:
        from datetime import datetime, timezone

        self._last_fetch = datetime.now(timezone.utc).isoformat()
        updates: Dict[str, Dict[str, Any]] = {}
        for loc in locations:
            loc_id = loc["id"]
            current = float(loc.get(self.field, 0) or 0)
            # Tiny cyclic jitter so ingest is visible without exploding scores
            delta = ((hash(loc_id + self._last_fetch[:16]) % 7) - 3) * self.jitter
            updates[loc_id] = {self.field: max(0.0, current + delta)}
        return updates


class UnavailableLiveProvider(EnvironmentalProvider):
    """Production adapter stub that refuses to pretend it is connected."""

    def __init__(self, provider_id: str, name: str, provides: str, credential_present: bool):
        self.id = provider_id
        self.name = name
        self.provides = provides
        self.credential_present = credential_present

    def status(self) -> ProviderStatus:
        if self.credential_present:
            return ProviderStatus(
                id=self.id,
                name=self.name,
                provides=self.provides,
                mode="planned",
                last_fetch=None,
                message="Credentials present but live API client is not implemented yet. Demo simulator remains active.",
            )
        return ProviderStatus(
            id=self.id,
            name=self.name,
            provides=self.provides,
            mode="planned",
            last_fetch=None,
            message="No API credentials. Live connection has not been attempted.",
        )

    def fetch_updates(self, locations: List[dict]) -> Dict[str, Dict[str, Any]]:
        return {}


class ProviderRegistry:
    def __init__(self) -> None:
        self.demo_providers: List[EnvironmentalProvider] = [
            DemoEnvironmentalProvider("imd", "India Meteorological Department (IMD)", "Rainfall data", "rainfall", 1.5),
            DemoEnvironmentalProvider("isro-bhuvan", "ISRO Bhuvan / Sentinel", "Elevation, slope and land-cover", "slope", 0.15),
            DemoEnvironmentalProvider("gsi-bhukosh", "GSI Bhukosh", "Landslide inventory / susceptibility", "seismic_index", 0.4),
            DemoEnvironmentalProvider("cwc", "Central Water Commission", "Soil moisture / hydrology", "soil_saturation", 0.8),
        ]
        self.live_stubs: List[EnvironmentalProvider] = [
            UnavailableLiveProvider("imd-live", "IMD live API", "Rainfall data", bool(settings.IMD_API_KEY.strip())),
            UnavailableLiveProvider("isro-live", "ISRO Bhuvan live API", "DEM / land-cover", bool(settings.ISRO_API_KEY.strip())),
            UnavailableLiveProvider("gsi-live", "GSI Bhukosh live API", "Inventory / susceptibility", bool(settings.GSI_API_KEY.strip())),
            UnavailableLiveProvider("cwc-live", "CWC live API", "Soil moisture / hydrology", bool(settings.CWC_API_KEY.strip())),
        ]

    def statuses(self) -> List[ProviderStatus]:
        return [p.status() for p in self.demo_providers + self.live_stubs]

    def fetch_demo_updates(self, locations: List[dict]) -> Dict[str, Dict[str, Any]]:
        merged: Dict[str, Dict[str, Any]] = {}
        for provider in self.demo_providers:
            for loc_id, patch in provider.fetch_updates(locations).items():
                merged.setdefault(loc_id, {}).update(patch)
        return merged


provider_registry = ProviderRegistry()
