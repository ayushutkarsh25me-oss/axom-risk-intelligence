from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings and environment variable configuration."""

    # Supabase (optional — empty values keep demo / in-memory mode)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "AXOM Backend"
    VERSION: str = "1.0.0"

    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Auth is off by default so the hackathon demo stays usable.
    AUTH_ENABLED: bool = False
    AUTH_SECRET: str = "axom-demo-secret-change-in-production"
    DEMO_ADMIN_EMAIL: str = "admin@axom.local"
    DEMO_ADMIN_PASSWORD: str = "axom-demo"

    # Optional 15-minute ingest loop (off by default; POST /api/ingest/run still works)
    ENABLE_SCHEDULER: bool = False
    INGEST_INTERVAL_MINUTES: int = 15

    # Optional live-feed credentials — never required for demo
    IMD_API_KEY: str = ""
    ISRO_API_KEY: str = ""
    GSI_API_KEY: str = ""
    CWC_API_KEY: str = ""

    ML_MODEL_PATH: str = ""

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_supabase_enabled(self) -> bool:
        return bool(self.SUPABASE_URL.strip() and self.SUPABASE_KEY.strip())

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
