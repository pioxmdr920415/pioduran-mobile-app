from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import uuid
import os
from collections import defaultdict

# Import shared database connection
from database import db

# Import auth
from auth import get_current_user

# Import caching
from cache import cached, short_cache, medium_cache

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


# Models
class AnalyticsEvent(BaseModel):
    event_type: str
    event_data: Optional[dict] = {}
    user_id: Optional[str] = None
    session_id: Optional[str] = None

class TimeRange(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None


# Utility functions
def get_date_range(days: int = 7):
    """Get date range for analytics queries"""
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)
    return start_date, end_date


async def track_event(event_type: str, event_data: dict = None, user_id: str = None):
    """Track an analytics event"""
    event = {
        "id": str(uuid.uuid4()),
        "event_type": event_type,
        "event_data": event_data or {},
        "user_id": user_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.analytics_events.insert_one(event)


# Routes
@router.post("/track")
async def track_analytics_event(event: AnalyticsEvent):
    """Track a custom analytics event"""
    try:
        await track_event(
            event_type=event.event_type,
            event_data=event.event_data,
            user_id=event.user_id
        )
        return {"success": True, "message": "Event tracked"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to track event: {str(e)}")


@router.get("/dashboard")
async def get_dashboard_analytics(
    days: int = 7,
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive dashboard analytics"""
    try:
        start_date, end_date = get_date_range(days)
        start_iso = start_date.isoformat()
        end_iso = end_date.isoformat()
        
        # Use aggregation pipeline for better performance
        incidents = await db.incidents.find({
            "created_at": {"$gte": start_iso, "$lte": end_iso}
        }, {"_id": 0, "status": 1, "incidentType": 1, "created_at": 1, "location": 1}).to_list(10000)
        
        users = await db.users.find({
            "created_at": {"$gte": start_iso, "$lte": end_iso}
        }, {"_id": 0, "created_at": 1}).to_list(10000)
        
        events = await db.analytics_events.find({
            "timestamp": {"$gte": start_iso, "$lte": end_iso}
        }, {"_id": 0, "event_type": 1, "timestamp": 1}).to_list(10000)
        
        # Calculate metrics
        total_incidents = len(incidents)
        total_new_users = len(users)
        total_events = len(events)
        
        # Incident status breakdown
        incident_status = defaultdict(int)
        incident_types = defaultdict(int)
        daily_incidents = defaultdict(int)
        geographic_data = {"total_geotagged": 0}
        
        for inc in incidents:
            incident_status[inc.get("status", "submitted")] += 1
            incident_types[inc.get("incidentType", "other")] += 1
            date = inc.get("created_at", "")[:10]
            daily_incidents[date] += 1
            location = inc.get("location")
            if location and location.get("lat") and location.get("lon"):
                geographic_data["total_geotagged"] += 1
        
        # Event type breakdown
        event_types = defaultdict(int)
        daily_users = defaultdict(int)
        
        for event in events:
            event_types[event.get("event_type", "unknown")] += 1
            if event.get("event_type") == "page_view":
                date = event.get("timestamp", "")[:10]
                daily_users[date] += 1
        
        return {
            "overview": {
                "total_incidents": total_incidents,
                "total_new_users": total_new_users,
                "total_events": total_events,
                "date_range": {
                    "start": start_iso,
                    "end": end_iso,
                    "days": days
                }
            },
            "incidents": {
                "by_status": dict(incident_status),
                "by_type": dict(incident_types),
                "daily_trend": dict(sorted(daily_incidents.items()))
            },
            "user_activity": {
                "daily_page_views": dict(sorted(daily_users.items())),
                "event_types": dict(event_types)
            },
            "geographic": {
                "geotagged_incidents": geographic_data.get("total_geotagged", 0),
                "total_incidents": total_incidents
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")


@router.get("/incidents")
async def get_incident_analytics(
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed incident analytics"""
    try:
        start_date, end_date = get_date_range(days)
        start_iso = start_date.isoformat()
        end_iso = end_date.isoformat()
        
        incidents = await db.incidents.find({
            "created_at": {"$gte": start_iso, "$lte": end_iso}
        }, {"_id": 0, "incidentType": 1, "status": 1, "created_at": 1}).to_list(10000)
        
        by_type = defaultdict(int)
        by_status = defaultdict(int)
        by_hour = defaultdict(int)
        
        for inc in incidents:
            by_type[inc.get("incidentType", "other")] += 1
            by_status[inc.get("status", "submitted")] += 1
            timestamp = inc.get("created_at", "")
            if timestamp:
                try:
                    hour = datetime.fromisoformat(timestamp).hour
                    by_hour[hour] += 1
                except:
                    pass
        
        return {
            "total": len(incidents),
            "by_type": dict(by_type),
            "by_status": dict(by_status),
            "by_hour": dict(sorted(by_hour.items())),
            "date_range": {"start": start_iso, "end": end_iso}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch incident analytics: {str(e)}")


@router.get("/users")
async def get_user_analytics(
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """Get user activity analytics"""
    try:
        start_date, end_date = get_date_range(days)
        start_iso = start_date.isoformat()
        end_iso = end_date.isoformat()
        
        users = await db.users.find({
            "created_at": {"$gte": start_iso, "$lte": end_iso}
        }, {"_id": 0, "created_at": 1}).to_list(10000)
        
        events = await db.analytics_events.find({
            "timestamp": {"$gte": start_iso, "$lte": end_iso}
        }, {"_id": 0, "user_id": 1, "event_type": 1}).to_list(10000)
        
        daily_registrations = defaultdict(int)
        for user in users:
            date = user.get("created_at", "")[:10]
            daily_registrations[date] += 1
        
        active_users = set()
        event_breakdown = defaultdict(int)
        for event in events:
            user_id = event.get("user_id")
            if user_id:
                active_users.add(user_id)
            event_breakdown[event.get("event_type", "unknown")] += 1
        
        return {
            "total_new_users": len(users),
            "total_active_users": len(active_users),
            "daily_registrations": dict(sorted(daily_registrations.items())),
            "event_breakdown": dict(event_breakdown),
            "date_range": {"start": start_iso, "end": end_iso}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user analytics: {str(e)}")


@router.get("/system")
async def get_system_analytics(current_user: dict = Depends(get_current_user)):
    """Get system performance metrics"""
    try:
        db_stats = await db.command("dbStats")
        
        # Parallel count queries for better performance
        incidents_count = await db.incidents.count_documents({})
        users_count = await db.users.count_documents({})
        events_count = await db.analytics_events.count_documents({})
        subscriptions_count = await db.push_subscriptions.count_documents({"active": True})
        
        storage_size = db_stats.get("dataSize", 0) / (1024 * 1024)
        
        return {
            "database": {
                "storage_mb": round(storage_size, 2),
                "collections": db_stats.get("collections", 0)
            },
            "counts": {
                "total_incidents": incidents_count,
                "total_users": users_count,
                "total_events": events_count,
                "active_subscriptions": subscriptions_count
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch system analytics: {str(e)}")


@router.get("/export")
async def export_analytics(
    days: int = 30,
    format: str = "json",
    current_user: dict = Depends(get_current_user)
):
    """Export analytics data (Admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can export analytics")
    
    try:
        start_date, end_date = get_date_range(days)
        start_iso = start_date.isoformat()
        end_iso = end_date.isoformat()
        
        incidents = await db.incidents.find({
            "created_at": {"$gte": start_iso, "$lte": end_iso}
        }, {"_id": 0}).to_list(10000)
        
        events = await db.analytics_events.find({
            "timestamp": {"$gte": start_iso, "$lte": end_iso}
        }, {"_id": 0}).to_list(10000)
        
        return {
            "export_date": datetime.now(timezone.utc).isoformat(),
            "date_range": {"start": start_iso, "end": end_iso},
            "incidents": incidents,
            "events": events,
            "summary": {
                "total_incidents": len(incidents),
                "total_events": len(events)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export analytics: {str(e)}")


@router.get("/realtime")
async def get_realtime_metrics(current_user: dict = Depends(get_current_user)):
    """Get real-time system metrics"""
    try:
        one_hour_ago = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        five_min_ago = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
        
        recent_incidents = await db.incidents.count_documents({
            "created_at": {"$gte": one_hour_ago}
        })
        
        recent_events = await db.analytics_events.count_documents({
            "timestamp": {"$gte": one_hour_ago}
        })
        
        active_users = len(await db.analytics_events.distinct("user_id", {
            "timestamp": {"$gte": five_min_ago},
            "user_id": {"$ne": None}
        }))
        
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "last_hour": {
                "incidents": recent_incidents,
                "events": recent_events
            },
            "current": {
                "active_users": active_users
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch realtime metrics: {str(e)}")


def include_analytics_routes(app):
    """Include analytics routes in the main app"""
    app.include_router(router)
