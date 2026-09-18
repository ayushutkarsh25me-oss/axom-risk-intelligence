import copy
import logging
import math
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.database.supabase_client import get_supabase_client, is_supabase_configured
from app.schemas.locations import LocationDetail, LocationSummary
from app.services.risk_service import generate_recommendation, risk_service
from app.schemas.risk import RiskPredictRequest

logger = logging.getLogger("axom.services.data")

SEISMIC_TO_INDEX = {"Low": 20.0, "Moderate": 50.0, "High": 80.0}


def seismic_to_index(value: Any) -> float:
    if isinstance(value, (int, float)):
        return float(value)
    return SEISMIC_TO_INDEX.get(str(value), 50.0)


def index_to_seismic(value: float) -> str:
    if value >= 70:
        return "High"
    if value >= 35:
        return "Moderate"
    return "Low"


def _make_history(base: float) -> List[float]:
    pts = []
    v = max(0.05, base - 0.28)
    for i in range(24):
        drift = (base - v) * 0.12
        noise = (math.sin(i * 1.7) + math.cos(i * 0.9)) * 0.015
        v = min(0.97, max(0.03, v + drift + noise))
        pts.append(round(v, 2))
    pts[-1] = round(base, 2)
    return pts


def _now_label() -> str:
    return datetime.now(timezone.utc).strftime("%H:%M UTC")


DEMO_LOCATIONS: List[dict] = [
    {
        "id": "east-khasi-hills",
        "name": "East Khasi Hills",
        "state": "Meghalaya",
        "district": "East Khasi Hills",
        "latitude": 25.45,
        "longitude": 91.75,
        "risk_score": 0.82,
        "risk_level": "CRITICAL",
        "rainfall": 142.0,
        "soil_saturation": 87.0,
        "slope": 34.0,
        "seismic_activity": "Moderate",
        "vegetation": 41.0,
        "confidence": 0.91,
        "recommendation": "Immediate evacuation advisory. Avoid slope-side roads and notify district authorities.",
        "trend_delta": 0.14,
        "last_updated": "10:45 PM",
        "history": _make_history(0.82),
    },
    {
        "id": "aizawl",
        "name": "Aizawl",
        "state": "Mizoram",
        "district": "Aizawl",
        "latitude": 23.72,
        "longitude": 92.72,
        "risk_score": 0.68,
        "risk_level": "HIGH",
        "rainfall": 108.0,
        "soil_saturation": 74.0,
        "slope": 38.0,
        "seismic_activity": "Low",
        "vegetation": 55.0,
        "confidence": 0.86,
        "recommendation": "Enhanced monitoring recommended. Pre-position response teams and restrict heavy vehicles on hill roads.",
        "trend_delta": 0.08,
        "last_updated": "10:45 PM",
        "history": _make_history(0.68),
    },
    {
        "id": "gangtok",
        "name": "Gangtok",
        "state": "Sikkim",
        "district": "East Sikkim",
        "latitude": 27.33,
        "longitude": 88.61,
        "risk_score": 0.64,
        "risk_level": "HIGH",
        "rainfall": 96.0,
        "soil_saturation": 71.0,
        "slope": 41.0,
        "seismic_activity": "High",
        "vegetation": 49.0,
        "confidence": 0.83,
        "recommendation": "Enhanced monitoring recommended. Inspect known landslide-prone stretches along NH-10.",
        "trend_delta": 0.05,
        "last_updated": "10:45 PM",
        "history": _make_history(0.64),
    },
    {
        "id": "itanagar",
        "name": "Itanagar",
        "state": "Arunachal Pradesh",
        "district": "Papum Pare",
        "latitude": 27.08,
        "longitude": 93.60,
        "risk_score": 0.61,
        "risk_level": "HIGH",
        "rainfall": 88.0,
        "soil_saturation": 69.0,
        "slope": 29.0,
        "seismic_activity": "Moderate",
        "vegetation": 62.0,
        "confidence": 0.80,
        "recommendation": "Enhanced monitoring recommended. Issue advisory to communities near cut slopes.",
        "trend_delta": 0.03,
        "last_updated": "10:45 PM",
        "history": _make_history(0.61),
    },
    {
        "id": "kohima",
        "name": "Kohima",
        "state": "Nagaland",
        "district": "Kohima",
        "latitude": 25.67,
        "longitude": 94.11,
        "risk_score": 0.46,
        "risk_level": "MODERATE",
        "rainfall": 61.0,
        "soil_saturation": 58.0,
        "slope": 27.0,
        "seismic_activity": "Low",
        "vegetation": 66.0,
        "confidence": 0.78,
        "recommendation": "Continue monitoring. No action required beyond routine surveillance.",
        "trend_delta": -0.02,
        "last_updated": "10:45 PM",
        "history": _make_history(0.46),
    },
    {
        "id": "shillong",
        "name": "Shillong",
        "state": "Meghalaya",
        "district": "East Khasi Hills",
        "latitude": 25.57,
        "longitude": 91.88,
        "risk_score": 0.44,
        "risk_level": "MODERATE",
        "rainfall": 58.0,
        "soil_saturation": 55.0,
        "slope": 22.0,
        "seismic_activity": "Moderate",
        "vegetation": 60.0,
        "confidence": 0.79,
        "recommendation": "Continue monitoring. Watch rainfall accumulation over the next 12 hours.",
        "trend_delta": 0.01,
        "last_updated": "10:45 PM",
        "history": _make_history(0.44),
    },
    {
        "id": "guwahati",
        "name": "Guwahati",
        "state": "Assam",
        "district": "Kamrup Metropolitan",
        "latitude": 26.14,
        "longitude": 91.73,
        "risk_score": 0.41,
        "risk_level": "MODERATE",
        "rainfall": 52.0,
        "soil_saturation": 53.0,
        "slope": 14.0,
        "seismic_activity": "Moderate",
        "vegetation": 47.0,
        "confidence": 0.82,
        "recommendation": "Continue monitoring. Localized risk concentrated on Nilachal and hillside colonies.",
        "trend_delta": -0.03,
        "last_updated": "10:45 PM",
        "history": _make_history(0.41),
    },
    {
        "id": "imphal",
        "name": "Imphal",
        "state": "Manipur",
        "district": "Imphal West",
        "latitude": 24.81,
        "longitude": 93.94,
        "risk_score": 0.28,
        "risk_level": "LOW",
        "rainfall": 34.0,
        "soil_saturation": 42.0,
        "slope": 11.0,
        "seismic_activity": "Low",
        "vegetation": 58.0,
        "confidence": 0.84,
        "recommendation": "No action required. Conditions stable within normal range.",
        "trend_delta": -0.04,
        "last_updated": "10:45 PM",
        "history": _make_history(0.28),
    },
]


def _recompute(loc: dict) -> dict:
    payload = RiskPredictRequest(
        rainfall=float(loc["rainfall"]),
        soil_saturation=float(loc["soil_saturation"]),
        slope=float(loc["slope"]),
        seismic_activity=seismic_to_index(loc.get("seismic_activity")),
        vegetation_cover=float(loc.get("vegetation", 50.0)),
    )
    result = risk_service.calculate_risk(payload)
    previous = float(loc.get("risk_score", result.risk_score))
    loc["risk_score"] = result.risk_score
    loc["risk_level"] = result.risk_level
    loc["recommendation"] = loc.get("recommendation") or result.recommendation
    loc["trend_delta"] = round(result.risk_score - previous, 2)
    history = list(loc.get("history") or [])
    history.append(result.risk_score)
    loc["history"] = history[-24:] if history else _make_history(result.risk_score)
    loc["last_updated"] = _now_label()
    return loc


class DataService:
    """Locations with latest risk_readings. Supabase when configured, else in-memory demo."""

    def __init__(self):
        self._locations = [copy.deepcopy(row) for row in DEMO_LOCATIONS]
        self.last_ingest_at: Optional[str] = None

    def storage_mode(self) -> str:
        return "supabase" if is_supabase_configured() else "demo"

    def get_raw_locations(self) -> List[dict]:
        supabase_rows = self._load_supabase_rows()
        if supabase_rows:
            return supabase_rows
        return self._locations

    def get_locations(self) -> List[LocationSummary]:
        return [self._to_summary(loc) for loc in self.get_raw_locations()]

    def get_location_detail(self, location_id: str) -> Optional[LocationDetail]:
        loc = next((l for l in self.get_raw_locations() if l["id"] == location_id), None)
        if not loc:
            return None
        if is_supabase_configured():
            history = self._history_from_supabase(location_id)
            if history:
                loc = {**loc, "history": history}
        return LocationDetail(**self._detail_kwargs(loc))

    def apply_feature_updates(self, updates: Dict[str, Dict[str, Any]]) -> List[dict]:
        changed: List[dict] = []
        for loc in self._locations:
            patch = updates.get(loc["id"])
            if not patch:
                continue
            if "rainfall" in patch:
                loc["rainfall"] = round(float(patch["rainfall"]), 1)
            if "soil_saturation" in patch:
                loc["soil_saturation"] = min(100.0, max(0.0, round(float(patch["soil_saturation"]), 1)))
            if "slope" in patch:
                loc["slope"] = min(90.0, max(0.0, round(float(patch["slope"]), 1)))
            if "seismic_index" in patch:
                loc["seismic_activity"] = index_to_seismic(float(patch["seismic_index"]))
            if "vegetation" in patch:
                loc["vegetation"] = min(100.0, max(0.0, float(patch["vegetation"])))
            _recompute(loc)
            loc["recommendation"] = generate_recommendation(loc["risk_level"])
            self._persist_reading(loc)
            changed.append(loc)
        self.last_ingest_at = datetime.now(timezone.utc).isoformat()
        return changed

    def _persist_reading(self, loc: dict) -> None:
        client = get_supabase_client()
        if not client:
            return
        try:
            client.table("risk_readings").insert(
                {
                    "location_id": loc["id"],
                    "rainfall": loc["rainfall"],
                    "soil_saturation": loc["soil_saturation"],
                    "slope": loc["slope"],
                    "seismic_activity": seismic_to_index(loc.get("seismic_activity")),
                    "vegetation_cover": loc.get("vegetation", 50.0),
                    "risk_score": loc["risk_score"],
                    "risk_level": loc["risk_level"],
                    "confidence": loc.get("confidence", 0.8),
                }
            ).execute()
        except Exception as exc:
            logger.warning("Could not persist risk_reading (%s)", exc)

    def _load_supabase_rows(self) -> Optional[List[dict]]:
        client = get_supabase_client()
        if not client:
            return None
        try:
            view_res = client.table("location_current_risk").select("*").execute()
            rows = view_res.data or []
            if not rows:
                loc_res = client.table("locations").select("*").execute()
                rows = loc_res.data or []
            if not rows:
                return None
            merged = []
            for row in rows:
                demo = next((d for d in self._locations if d["id"] == row.get("id")), {})
                rainfall = row.get("rainfall")
                if rainfall is None:
                    rainfall = demo.get("rainfall", 0.0)
                soil = row.get("soil_saturation")
                if soil is None:
                    soil = demo.get("soil_saturation", 0.0)
                score = row.get("risk_score")
                if score is None:
                    score = demo.get("risk_score", 0.3)
                level = row.get("risk_level") or demo.get("risk_level", "LOW")
                merged.append(
                    {
                        "id": row["id"],
                        "name": row.get("name", demo.get("name", row["id"])),
                        "state": row.get("state", demo.get("state", "")),
                        "district": row.get("district", demo.get("district", "")),
                        "latitude": row.get("latitude", demo.get("latitude", 0.0)),
                        "longitude": row.get("longitude", demo.get("longitude", 0.0)),
                        "risk_score": float(score),
                        "risk_level": str(level).upper(),
                        "rainfall": float(rainfall),
                        "soil_saturation": float(soil),
                        "slope": float(row.get("slope") if row.get("slope") is not None else demo.get("slope", 0.0)),
                        "seismic_activity": row.get("base_seismic")
                        or demo.get("seismic_activity", "Low"),
                        "vegetation": float(
                            row.get("vegetation")
                            if row.get("vegetation") is not None
                            else demo.get("vegetation", 50.0)
                        ),
                        "confidence": float(row.get("confidence") or demo.get("confidence", 0.8)),
                        "recommendation": row.get("recommendation") or demo.get("recommendation", ""),
                        "trend_delta": demo.get("trend_delta", 0.0),
                        "last_updated": _now_label(),
                        "history": demo.get("history") or _make_history(float(score)),
                    }
                )
            return merged
        except Exception as exc:
            logger.warning("Failed to query Supabase locations (%s). Using demo dataset.", exc)
            return None

    def _history_from_supabase(self, location_id: str) -> List[float]:
        client = get_supabase_client()
        if not client:
            return []
        try:
            res = (
                client.table("risk_readings")
                .select("risk_score,recorded_at")
                .eq("location_id", location_id)
                .order("recorded_at", desc=False)
                .limit(24)
                .execute()
            )
            rows = res.data or []
            return [float(r["risk_score"]) for r in rows if r.get("risk_score") is not None]
        except Exception as exc:
            logger.warning("Failed to query risk history (%s)", exc)
            return []

    def _to_summary(self, loc: dict) -> LocationSummary:
        return LocationSummary(**self._summary_kwargs(loc))

    def _summary_kwargs(self, loc: dict) -> dict:
        return {
            "id": loc["id"],
            "name": loc["name"],
            "state": loc["state"],
            "district": loc.get("district", ""),
            "latitude": loc["latitude"],
            "longitude": loc["longitude"],
            "risk_score": loc["risk_score"],
            "risk_level": loc["risk_level"],
            "rainfall": loc["rainfall"],
            "soil_saturation": loc["soil_saturation"],
            "slope": loc["slope"],
            "seismic_activity": loc.get("seismic_activity", "Low"),
            "last_updated": loc.get("last_updated", _now_label()),
        }

    def _detail_kwargs(self, loc: dict) -> dict:
        return {
            **self._summary_kwargs(loc),
            "confidence": loc.get("confidence", 0.85),
            "vegetation": loc.get("vegetation", 50.0),
            "recommendation": loc.get("recommendation", ""),
            "trend_delta": loc.get("trend_delta", 0.0),
            "history": loc.get("history") or [],
        }


data_service = DataService()
