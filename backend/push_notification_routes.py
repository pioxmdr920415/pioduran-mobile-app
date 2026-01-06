from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import os
import json
from pywebpush import webpush, WebPushException
from motor.motor_asyncio import AsyncIOMotorClient
from auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# VAPID configuration
VAPID_PUBLIC_KEY = os.environ.get('VAPID_PUBLIC_KEY')
VAPID_PRIVATE_KEY = os.environ.get('VAPID_PRIVATE_KEY')
VAPID_CLAIMS = {
    "sub": os.environ.get('VAPID_CLAIMS_EMAIL', 'mailto:admin@emergency.com')
}

# Models
class PushSubscription(BaseModel):
    endpoint: str
    keys: dict
    expirationTime: Optional[int] = None

class SubscriptionCreate(BaseModel):
    subscription: PushSubscription
    user_id: Optional[str] = None
    preferences: Optional[dict] = {
        "incidents": True,
        "typhoons": True,
        "emergency_broadcasts": True,
        "system_updates": True
    }

class NotificationSend(BaseModel):
    title: str
    body: str
    icon: Optional[str] = "/pwa-icons/icon-192x192.png"
    data: Optional[dict] = {}
    notification_type: str = "general"  # incidents, typhoons, emergency_broadcasts, system_updates
    target_users: Optional[List[str]] = None  # None = all users

class NotificationPreferences(BaseModel):
    user_id: str
    incidents: bool = True
    typhoons: bool = True
    emergency_broadcasts: bool = True
    system_updates: bool = True

# Routes
@router.post("/subscribe")
async def subscribe_to_push(data: SubscriptionCreate):
    """Subscribe a user to push notifications"""
    try:
        subscription_doc = {
            "id": str(uuid.uuid4()),
            "user_id": data.user_id,
            "endpoint": data.subscription.endpoint,
            "keys": data.subscription.keys,
            "expirationTime": data.subscription.expirationTime,
            "preferences": data.preferences,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "active": True
        }
        
        # Check if subscription already exists
        existing = await db.push_subscriptions.find_one({"endpoint": data.subscription.endpoint})
        if existing:
            # Update existing subscription
            await db.push_subscriptions.update_one(
                {"endpoint": data.subscription.endpoint},
                {"$set": subscription_doc}
            )
        else:
            # Create new subscription
            await db.push_subscriptions.insert_one(subscription_doc)
        
        return {
            "success": True,
            "message": "Successfully subscribed to push notifications",
            "vapid_public_key": VAPID_PUBLIC_KEY
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Subscription failed: {str(e)}")

@router.post("/unsubscribe")
async def unsubscribe_from_push(endpoint: str):
    """Unsubscribe from push notifications"""
    try:
        result = await db.push_subscriptions.update_one(
            {"endpoint": endpoint},
            {"$set": {"active": False}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Subscription not found")
        
        return {"success": True, "message": "Successfully unsubscribed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unsubscribe failed: {str(e)}")

@router.post("/send")
async def send_notification(notification: NotificationSend, current_user: dict = Depends(get_current_user)):
    """Send push notification to users (Admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can send notifications")
    
    try:
        # Build query for target users
        query = {"active": True}
        
        # Filter by notification type preferences
        query[f"preferences.{notification.notification_type}"] = True
        
        # Filter by specific users if provided
        if notification.target_users:
            query["user_id"] = {"$in": notification.target_users}
        
        # Get all matching subscriptions
        subscriptions = await db.push_subscriptions.find(query).to_list(10000)
        
        if not subscriptions:
            return {"success": True, "sent": 0, "message": "No active subscriptions found"}
        
        # Prepare notification payload
        payload = json.dumps({
            "title": notification.title,
            "body": notification.body,
            "icon": notification.icon,
            "data": notification.data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        # Send to all subscriptions
        sent_count = 0
        failed_count = 0
        
        for sub in subscriptions:
            try:
                subscription_info = {
                    "endpoint": sub["endpoint"],
                    "keys": sub["keys"]
                }
                
                webpush(
                    subscription_info=subscription_info,
                    data=payload,
                    vapid_private_key=VAPID_PRIVATE_KEY,
                    vapid_claims=VAPID_CLAIMS
                )
                
                sent_count += 1
            except WebPushException as e:
                failed_count += 1
                # If subscription is invalid, mark as inactive
                if e.response and e.response.status_code in [404, 410]:
                    await db.push_subscriptions.update_one(
                        {"endpoint": sub["endpoint"]},
                        {"$set": {"active": False}}
                    )
        
        # Log notification
        await db.notification_logs.insert_one({
            "id": str(uuid.uuid4()),
            "title": notification.title,
            "body": notification.body,
            "notification_type": notification.notification_type,
            "sent_by": current_user.get("id"),
            "sent_count": sent_count,
            "failed_count": failed_count,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "success": True,
            "sent": sent_count,
            "failed": failed_count,
            "message": f"Notification sent to {sent_count} users"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send notifications: {str(e)}")

@router.get("/preferences/{user_id}")
async def get_notification_preferences(user_id: str):
    """Get notification preferences for a user"""
    subscription = await db.push_subscriptions.find_one({"user_id": user_id, "active": True})
    
    if not subscription:
        return {
            "incidents": True,
            "typhoons": True,
            "emergency_broadcasts": True,
            "system_updates": True
        }
    
    return subscription.get("preferences", {
        "incidents": True,
        "typhoons": True,
        "emergency_broadcasts": True,
        "system_updates": True
    })

@router.put("/preferences")
async def update_notification_preferences(preferences: NotificationPreferences):
    """Update notification preferences for a user"""
    try:
        result = await db.push_subscriptions.update_many(
            {"user_id": preferences.user_id, "active": True},
            {"$set": {
                "preferences.incidents": preferences.incidents,
                "preferences.typhoons": preferences.typhoons,
                "preferences.emergency_broadcasts": preferences.emergency_broadcasts,
                "preferences.system_updates": preferences.system_updates
            }}
        )
        
        return {
            "success": True,
            "message": "Preferences updated successfully",
            "updated_count": result.modified_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update preferences: {str(e)}")

@router.get("/history")
async def get_notification_history(current_user: dict = Depends(get_current_user), limit: int = 50):
    """Get notification history (Admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view notification history")
    
    logs = await db.notification_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    return logs

@router.get("/vapid-public-key")
async def get_vapid_public_key():
    """Get VAPID public key for push subscription"""
    return {"publicKey": VAPID_PUBLIC_KEY}

def include_push_notification_routes(app):
    """Include push notification routes in the main app"""
    app.include_router(router)
