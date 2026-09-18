from typing import Optional
from pydantic import BaseModel, Field


class NotificationChannels(BaseModel):
    sms: bool = True
    email: bool = True
    push: bool = False


class AppSettings(BaseModel):
    high_threshold: float = Field(0.6, ge=0.2, le=0.9)
    critical_threshold: float = Field(0.8, ge=0.5, le=0.99)
    refresh_minutes: int = Field(15, ge=5, le=60)
    channels: NotificationChannels = Field(default_factory=NotificationChannels)
    demo_mode: bool = True


class SettingsResponse(AppSettings):
    persisted: bool = False
    storage: str = "memory"
