from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import PlainTextResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from contextlib import asynccontextmanager

# Import centralized database connection
from database import db, client, close_client

# Import authentication and incident management
from auth import include_auth_routes, include_incident_routes
from typhoon_routes import include_typhoon_routes
from push_notification_routes import include_push_notification_routes
from analytics_routes import include_analytics_routes
from ai_chat_routes import include_ai_chat_routes

# Import caching
from cache import clear_all_caches

# Import logging and monitoring
from logging_config import (
    setup_logging,
    setup_sentry,
    RequestLoggingMiddleware,
    PerformanceMonitoringMiddleware,
    get_metrics,
    logger
)

# Import database initialization
from init_db import create_indexes


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Setup logging and monitoring
setup_logging()
setup_sentry()


# Application lifespan for startup/shutdown
@asynccontextmanager
async def app_lifespan(app: FastAPI):
    """Application lifespan context manager for startup/shutdown events."""
    # Startup
    logger.info("Application startup - initializing...")
    
    try:
        # Create database indexes
        await create_indexes()
        
        # Seed demo users if not exist
        await _ensure_bootstrap_data()
        
        logger.info("Application startup complete")
    except Exception as e:
        logger.warning(f"Startup initialization warning: {e}")
    
    yield
    
    # Shutdown
    logger.info("Application shutdown - cleaning up...")
    clear_all_caches()
    await close_client()
    logger.info("Application shutdown complete")


async def _ensure_bootstrap_data():
    """Ensure demo users exist in database."""
    try:
        existing_admin = await db.users.find_one({"username": "admin"})
        if not existing_admin:
            import bcrypt
            await db.users.insert_one({
                "id": str(uuid.uuid4()),
                "username": "admin",
                "email": "admin@emergency.com",
                "hashed_password": bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode("utf-8"),
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            logger.info("Created admin user")

        existing_user = await db.users.find_one({"username": "testuser"})
        if not existing_user:
            import bcrypt
            await db.users.insert_one({
                "id": str(uuid.uuid4()),
                "username": "testuser",
                "email": "user@test.com",
                "hashed_password": bcrypt.hashpw(b"test123", bcrypt.gensalt()).decode("utf-8"),
                "role": "user",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            logger.info("Created test user")
    except Exception as e:
        logger.warning(f"Bootstrap data setup warning: {e}")


# Create the main app with lifespan
app = FastAPI(
    title="Emergency Response API",
    description="API for emergency incident reporting and management",
    version="1.0.0",
    lifespan=app_lifespan
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Incident Report Models
class LocationData(BaseModel):
    lat: Optional[float] = None
    lon: Optional[float] = None

class IncidentReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    incidentType: str
    fullName: str
    phoneNumber: Optional[str] = ""
    description: str
    images: List[str] = []
    location: Optional[LocationData] = None
    address: Optional[str] = ""
    timestamp: str
    status: str = "submitted"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IncidentReportCreate(BaseModel):
    incidentType: str
    fullName: str
    phoneNumber: Optional[str] = ""
    description: str
    images: List[str] = []
    location: Optional[LocationData] = None
    address: Optional[str] = ""
    timestamp: str
    status: str = "submitted"


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)

    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])

    return status_checks

@api_router.get("/health")
async def health_check():
    """Enhanced health check endpoint with system metrics (non-blocking)."""
    try:
        # Check database connection
        await db.command('ping')
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "unhealthy"

    import psutil
    
    # Non-blocking system metrics (no interval parameter)
    health_data = {
        "status": "healthy" if db_status == "healthy" else "unhealthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "database": db_status,
            "api": "healthy"
        },
        "system": {
            "cpu_percent": psutil.cpu_percent(interval=None),  # Non-blocking
            "memory_percent": psutil.virtual_memory().percent,
            "disk_usage": psutil.disk_usage('/').percent
        },
        "version": "1.0.0"
    }

    logger.info("Health check performed", extra={"health_status": health_data["status"]})
    return health_data

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint."""
    from prometheus_client import CONTENT_TYPE_LATEST
    return PlainTextResponse(
        get_metrics(),
        media_type=CONTENT_TYPE_LATEST
    )

@api_router.get("/cache/stats")
async def cache_stats():
    """Get cache statistics."""
    from cache import short_cache, medium_cache, long_cache
    return {
        "short_cache": short_cache.stats,
        "medium_cache": medium_cache.stats,
        "long_cache": long_cache.stats
    }

@api_router.post("/cache/clear")
async def clear_cache():
    """Clear all caches (admin operation)."""
    clear_all_caches()
    return {"message": "All caches cleared"}

# Include the router in the main app
app.include_router(api_router)

# Include authentication and incident management routes
include_auth_routes(app)
include_incident_routes(app)
include_typhoon_routes(app)
include_push_notification_routes(app)
include_analytics_routes(app)
include_ai_chat_routes(app)

# Add GZip compression middleware (compress responses > 500 bytes)
app.add_middleware(GZipMiddleware, minimum_size=500)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add monitoring middleware
app.add_middleware(PerformanceMonitoringMiddleware)
app.add_middleware(RequestLoggingMiddleware)


@app.on_event("shutdown")
async def shutdown_db_client():
    await close_client()
