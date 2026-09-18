import logging
from typing import Optional

from app.database.supabase_client import get_supabase_client
from app.schemas.settings import AppSettings, NotificationChannels, SettingsResponse

logger = logging.getLogger("axom.services.settings")

_DEFAULT = AppSettings()


class SettingsService:
    def __init__(self):
        self._memory = _DEFAULT.model_copy(deep=True)

    def get(self) -> SettingsResponse:
        remote = self._load()
        current = remote or self._memory
        return SettingsResponse(
            **current.model_dump(),
            persisted=remote is not None,
            storage="supabase" if remote is not None else "memory",
        )

    def update(self, payload: AppSettings) -> SettingsResponse:
        if payload.critical_threshold <= payload.high_threshold:
            payload.critical_threshold = min(0.99, payload.high_threshold + 0.05)
        self._memory = payload.model_copy(deep=True)
        persisted = self._save(self._memory)
        return SettingsResponse(
            **self._memory.model_dump(),
            persisted=persisted,
            storage="supabase" if persisted else "memory",
        )

    def channels(self) -> NotificationChannels:
        return self.get().channels

    def _load(self) -> Optional[AppSettings]:
        client = get_supabase_client()
        if not client:
            return None
        try:
            res = client.table("app_settings").select("payload").eq("id", "default").limit(1).execute()
            rows = res.data or []
            if not rows:
                return None
            return AppSettings.model_validate(rows[0]["payload"])
        except Exception as exc:
            logger.warning("Could not load settings (%s)", exc)
            return None

    def _save(self, payload: AppSettings) -> bool:
        client = get_supabase_client()
        if not client:
            return False
        try:
            client.table("app_settings").upsert(
                {"id": "default", "payload": payload.model_dump()}
            ).execute()
            return True
        except Exception as exc:
            logger.warning("Could not persist settings (%s)", exc)
            return False


settings_service = SettingsService()
