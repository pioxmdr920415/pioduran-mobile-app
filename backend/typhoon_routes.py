from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import os
from dotenv import load_dotenv
from pathlib import Path

# Import shared database connection
from database import db

# Import auth
from auth import get_current_user

# Import caching
from cache import cached, short_cache, medium_cache, invalidate_cache

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')


# Typhoon Models
class LocationData(BaseModel):
    lat: float
    lon: float

class TrackingPoint(BaseModel):
    lat: float
    lon: float
    time: str
    windSpeed: Optional[int] = None
    pressure: Optional[int] = None

class ForecastData(BaseModel):
    time: str
    windSpeed: int
    pressure: int
    location: LocationData
    intensity: str

class Typhoon(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    as_of: str
    near_location: str
    windSpeed: int
    pressure: int
    location: LocationData
    direction: str
    speed: int
    status: str = "active"
    description: str
    affectedAreas: List[str] = []
    warnings: List[str] = []
    preparedness: List[str] = []
    trackingPath: List[TrackingPoint] = []
    forecast: List[ForecastData] = []
    totalDistance: Optional[int] = 0
    trackingTime: Optional[int] = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

class TyphoonCreate(BaseModel):
    name: str
    category: str
    as_of: str
    near_location: str
    windSpeed: int
    pressure: int
    location: LocationData
    direction: str
    speed: int
    description: str
    affectedAreas: List[str] = []
    warnings: List[str] = []
    preparedness: List[str] = []
    trackingPath: List[TrackingPoint] = []
    forecast: List[ForecastData] = []
    totalDistance: Optional[int] = 0
    trackingTime: Optional[int] = 0

class TyphoonUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    as_of: Optional[str] = None
    near_location: Optional[str] = None
    windSpeed: Optional[int] = None
    pressure: Optional[int] = None
    location: Optional[LocationData] = None
    direction: Optional[str] = None
    speed: Optional[int] = None
    status: Optional[str] = None
    description: Optional[str] = None
    affectedAreas: Optional[List[str]] = None
    warnings: Optional[List[str]] = None
    preparedness: Optional[List[str]] = None
    trackingPath: Optional[List[TrackingPoint]] = None
    forecast: Optional[List[ForecastData]] = None
    totalDistance: Optional[int] = None
    trackingTime: Optional[int] = None

class TrackingPointAdd(BaseModel):
    lat: float
    lon: float
    time: str
    windSpeed: Optional[int] = None
    pressure: Optional[int] = None


# Helper function to check if user is admin
async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


# Typhoon Router
typhoon_router = APIRouter()


def _process_typhoon_timestamps(typhoon: dict) -> dict:
    """Helper to process typhoon timestamps."""
    if isinstance(typhoon.get('created_at'), str):
        typhoon['created_at'] = datetime.fromisoformat(typhoon['created_at'])
    if typhoon.get('updated_at') and isinstance(typhoon['updated_at'], str):
        typhoon['updated_at'] = datetime.fromisoformat(typhoon['updated_at'])
    return typhoon


@typhoon_router.post("/", response_model=Typhoon)
async def create_typhoon(
    typhoon: TyphoonCreate,
    current_user: dict = Depends(require_admin)
):
    """Create a new typhoon entry (Admin only)"""
    typhoon_dict = typhoon.model_dump()
    typhoon_dict["id"] = str(uuid.uuid4())
    typhoon_dict["status"] = "active"
    typhoon_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    typhoon_dict["created_by"] = current_user.get("username")
    
    await db.typhoons.insert_one(typhoon_dict)
    created_typhoon = await db.typhoons.find_one({"id": typhoon_dict["id"]}, {"_id": 0})
    
    # Invalidate typhoon caches
    invalidate_cache("typhoons")
    invalidate_cache("active_typhoons")
    
    return _process_typhoon_timestamps(created_typhoon)


@typhoon_router.get("/", response_model=List[Typhoon])
async def get_typhoons(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    """Get all typhoons with optional status filter"""
    query = {}
    if status:
        query["status"] = status
    
    typhoons = await db.typhoons.find(
        query, 
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return [_process_typhoon_timestamps(t) for t in typhoons]


@typhoon_router.get("/active", response_model=List[Typhoon])
async def get_active_typhoons():
    """Get all currently active typhoons (cached for 1 minute)"""
    typhoons = await db.typhoons.find(
        {"status": "active"}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return [_process_typhoon_timestamps(t) for t in typhoons]


@typhoon_router.get("/{typhoon_id}", response_model=Typhoon)
async def get_typhoon(typhoon_id: str):
    """Get a specific typhoon by ID"""
    typhoon = await db.typhoons.find_one({"id": typhoon_id}, {"_id": 0})
    if not typhoon:
        raise HTTPException(status_code=404, detail="Typhoon not found")
    
    return _process_typhoon_timestamps(typhoon)


@typhoon_router.put("/{typhoon_id}", response_model=Typhoon)
async def update_typhoon(
    typhoon_id: str,
    typhoon_update: TyphoonUpdate,
    current_user: dict = Depends(require_admin)
):
    """Update a typhoon entry (Admin only)"""
    update_data = {k: v for k, v in typhoon_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    update_data["updated_by"] = current_user.get("username")
    
    result = await db.typhoons.update_one(
        {"id": typhoon_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        exists = await db.typhoons.find_one({"id": typhoon_id})
        if not exists:
            raise HTTPException(status_code=404, detail="Typhoon not found")
    
    updated_typhoon = await db.typhoons.find_one({"id": typhoon_id}, {"_id": 0})
    
    # Invalidate caches
    invalidate_cache("typhoons")
    invalidate_cache("active_typhoons")
    
    return _process_typhoon_timestamps(updated_typhoon)


@typhoon_router.put("/{typhoon_id}/archive", response_model=Typhoon)
async def archive_typhoon(
    typhoon_id: str,
    current_user: dict = Depends(require_admin)
):
    """Archive a typhoon (change status to inactive) (Admin only)"""
    update_data = {
        "status": "inactive",
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "updated_by": current_user.get("username")
    }
    
    result = await db.typhoons.update_one(
        {"id": typhoon_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        typhoon = await db.typhoons.find_one({"id": typhoon_id})
        if not typhoon:
            raise HTTPException(status_code=404, detail="Typhoon not found")
    
    archived_typhoon = await db.typhoons.find_one({"id": typhoon_id}, {"_id": 0})
    
    # Invalidate caches
    invalidate_cache("typhoons")
    invalidate_cache("active_typhoons")
    
    return _process_typhoon_timestamps(archived_typhoon)


@typhoon_router.post("/{typhoon_id}/tracking", response_model=Typhoon)
async def add_tracking_point(
    typhoon_id: str,
    tracking_point: TrackingPointAdd,
    current_user: dict = Depends(require_admin)
):
    """Add a tracking point to typhoon's path (Admin only)"""
    typhoon = await db.typhoons.find_one({"id": typhoon_id})
    if not typhoon:
        raise HTTPException(status_code=404, detail="Typhoon not found")
    
    new_point = tracking_point.model_dump()
    
    await db.typhoons.update_one(
        {"id": typhoon_id},
        {
            "$push": {"trackingPath": new_point},
            "$set": {
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "updated_by": current_user.get("username")
            }
        }
    )
    
    updated_typhoon = await db.typhoons.find_one({"id": typhoon_id}, {"_id": 0})
    
    # Invalidate caches
    invalidate_cache("typhoons")
    invalidate_cache("active_typhoons")
    
    return _process_typhoon_timestamps(updated_typhoon)


@typhoon_router.delete("/{typhoon_id}")
async def delete_typhoon(
    typhoon_id: str,
    current_user: dict = Depends(require_admin)
):
    """Delete a typhoon entry (Admin only)"""
    result = await db.typhoons.delete_one({"id": typhoon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Typhoon not found")
    
    # Invalidate caches
    invalidate_cache("typhoons")
    invalidate_cache("active_typhoons")
    
    return {"message": "Typhoon deleted successfully"}


# Include router in main app
def include_typhoon_routes(app):
    app.include_router(typhoon_router, prefix="/api/typhoons", tags=["Typhoons"])
