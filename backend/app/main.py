import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.ml.model import ml_model
from app.database.supabase_client import is_supabase_configured
from app.scheduler import start_scheduler, stop_scheduler
from app.routers import (
    health_router,
    locations_router,
    risk_router,
    ml_router,
    alerts_router,
    analytics_router,
    auth_router,
    settings_router,
    ingest_router,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("axom.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AXOM Landslide Risk Intelligence backend...")
    ml_model.ensure_ready()
    if is_supabase_configured():
        logger.info("Database: Supabase PostgreSQL connected.")
    else:
        logger.info("Database: Running in DEMO / In-Memory mode.")
    start_scheduler()
    yield
    stop_scheduler()
    logger.info("Shutting down AXOM backend...")


app = FastAPI(
    title="AXOM Landslide Risk Intelligence API",
    description=(
        "Early warning and landslide risk monitoring command centre backend for the "
        "North Eastern Region of India (Smart India Hackathon SIH26001)."
    ),
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(locations_router, prefix="/api")
app.include_router(risk_router, prefix="/api")
app.include_router(ml_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(settings_router, prefix="/api")
app.include_router(ingest_router, prefix="/api")


@app.get("/", tags=["Root"])
def root_info():
    return {
        "service": "AXOM Landslide Risk Intelligence API",
        "version": settings.VERSION,
        "status": "online",
        "database_mode": "Supabase" if is_supabase_configured() else "Demo In-Memory",
        "auth_enabled": settings.AUTH_ENABLED,
        "documentation": "/docs",
    }
