from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import os
import uuid
from dotenv import load_dotenv
from pathlib import Path
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Import shared database connection
from database import db

# Import caching
from cache import cached, short_cache, medium_cache, invalidate_cache

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Security setup
security = HTTPBearer()
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Thread pool for CPU-bound bcrypt operations
_executor = ThreadPoolExecutor(max_workers=4)


# Authentication Models
class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    role: str = "user"

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class TokenData(BaseModel):
    username: Optional[str] = None

# User Model
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: Optional[str] = None
    hashed_password: str
    role: str = "user"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Incident Report Models (enhanced)
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
    assigned_to: Optional[str] = None
    priority: str = "medium"

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
    priority: str = "medium"

class IncidentReportUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None


# Async bcrypt operations (non-blocking)
async def hash_password_async(password: str) -> str:
    """Hash password asynchronously to avoid blocking."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        _executor,
        lambda: bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    )

async def verify_password_async(password: str, hashed: str) -> bool:
    """Verify password asynchronously to avoid blocking."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        _executor,
        lambda: bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    )

# Synchronous versions for compatibility
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"username": token_data.username}, {"_id": 0})
    if user is None:
        raise credentials_exception
    return user

# Authentication Router
auth_router = APIRouter()

@auth_router.post("/register", response_model=Dict[str, Any])
async def register_user(user: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create new user with async password hashing
    hashed_password = await hash_password_async(user.password)
    user_dict = {
        "id": str(uuid.uuid4()),
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
        "role": user.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_dict)
    return {"message": "User registered successfully"}

@auth_router.post("/login", response_model=Token)
async def login_user(user: UserLogin):
    db_user = await db.users.find_one({"username": user.username})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Use async password verification
    is_valid = await verify_password_async(user.password, db_user["hashed_password"])
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user["username"], "role": db_user.get("role", "user")}, 
        expires_delta=access_token_expires
    )
    
    user_data = {
        "username": db_user["username"],
        "email": db_user.get("email"),
        "role": db_user.get("role", "user"),
        "id": db_user.get("id")
    }
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user_data
    }

@auth_router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return {
        "username": current_user.get("username"),
        "email": current_user.get("email"),
        "role": current_user.get("role", "user"),
        "id": current_user.get("id"),
        "created_at": current_user.get("created_at")
    }

# Incident Reports Router
incident_router = APIRouter()

@incident_router.post("/", response_model=IncidentReport)
async def create_incident_report(report: IncidentReportCreate):
    """Create a new incident report"""
    report_dict = report.model_dump()
    report_dict["id"] = str(uuid.uuid4())
    report_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.incident_reports.insert_one(report_dict)
    created_report = await db.incident_reports.find_one(
        {"_id": result.inserted_id}, 
        {"_id": 0}
    )
    
    if isinstance(created_report['created_at'], str):
        created_report['created_at'] = datetime.fromisoformat(created_report['created_at'])
    
    # Invalidate incidents cache
    invalidate_cache("incidents")
    
    return created_report

@incident_router.get("/", response_model=List[IncidentReport])
async def get_incident_reports(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    priority: Optional[str] = None,
):
    """Get all incident reports with optional filtering"""
    query = {}
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    
    # Use projection to fetch only needed fields
    reports = await db.incident_reports.find(
        query, 
        {"_id": 0}
    ).skip(skip).limit(limit).to_list(limit)
    
    for report in reports:
        if isinstance(report.get('created_at'), str):
            report['created_at'] = datetime.fromisoformat(report['created_at'])
    
    return reports

@incident_router.get("/{report_id}", response_model=IncidentReport)
async def get_incident_report(report_id: str):
    """Get a specific incident report by ID"""
    report = await db.incident_reports.find_one({"id": report_id}, {"_id": 0})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if isinstance(report['created_at'], str):
        report['created_at'] = datetime.fromisoformat(report['created_at'])
    
    return report

@incident_router.put("/{report_id}", response_model=IncidentReport)
async def update_incident_report(
    report_id: str,
    report_update: IncidentReportUpdate,
):
    """Update an incident report"""
    update_data = {k: v for k, v in report_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.incident_reports.update_one(
        {"id": report_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Report not found or no changes made")
    
    updated_report = await db.incident_reports.find_one({"id": report_id}, {"_id": 0})
    
    if isinstance(updated_report['created_at'], str):
        updated_report['created_at'] = datetime.fromisoformat(updated_report['created_at'])
    if "updated_at" in updated_report and isinstance(updated_report['updated_at'], str):
        updated_report['updated_at'] = datetime.fromisoformat(updated_report['updated_at'])
    
    # Invalidate cache
    invalidate_cache("incidents")
    
    return updated_report

@incident_router.delete("/{report_id}")
async def delete_incident_report(report_id: str):
    """Delete an incident report"""
    result = await db.incident_reports.delete_one({"id": report_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Invalidate cache
    invalidate_cache("incidents")
    
    return {"message": "Report deleted successfully"}

@incident_router.get("/user/{user_id}", response_model=List[IncidentReport])
async def get_user_reports(user_id: str):
    """Get all reports for a specific user"""
    reports = await db.incident_reports.find(
        {"fullName": user_id}, 
        {"_id": 0}
    ).to_list(1000)
    
    for report in reports:
        if isinstance(report['created_at'], str):
            report['created_at'] = datetime.fromisoformat(report['created_at'])
    
    return reports

# Include routers in main app
def include_auth_routes(app):
    app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])

def include_incident_routes(app):
    app.include_router(incident_router, prefix="/api/incidents", tags=["Incident Reports"])
