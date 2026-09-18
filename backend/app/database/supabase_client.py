import logging
from typing import Optional
from supabase import create_client, Client
from app.config import settings

logger = logging.getLogger("axom.database")

_supabase_client: Optional[Client] = None
_initialization_attempted: bool = False


def get_supabase_client() -> Optional[Client]:
    """
    Returns the Supabase Client if configured with valid credentials.
    Returns None if unconfigured or unreachable, allowing safe fallback to Demo Mode.
    """
    global _supabase_client, _initialization_attempted

    if _supabase_client is not None:
        return _supabase_client

    if _initialization_attempted:
        return None

    _initialization_attempted = True

    if not settings.is_supabase_enabled:
        logger.info(
            "Supabase credentials not found in environment. AXOM is running in safe DEMO / In-Memory mode."
        )
        return None

    try:
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("Successfully connected to Supabase PostgreSQL.")
        return _supabase_client
    except Exception as e:
        logger.warning(
            f"Failed to initialize Supabase client ({e}). Falling back to safe DEMO / In-Memory mode."
        )
        _supabase_client = None
        return None


def is_supabase_configured() -> bool:
    """Returns True if a live Supabase connection is active."""
    return get_supabase_client() is not None
