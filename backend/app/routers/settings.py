from fastapi import APIRouter

from app.schemas.settings import AppSettings, SettingsResponse
from app.services.settings_service import settings_service

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=SettingsResponse)
def get_settings():
    return settings_service.get()


@router.put("", response_model=SettingsResponse)
def update_settings(payload: AppSettings):
    return settings_service.update(payload)
