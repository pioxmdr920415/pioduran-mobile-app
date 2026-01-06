"""
Script to create test admin user
Run this script to add admin credentials to the database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import uuid
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def create_admin_user():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"username": "admin"})
    
    if existing_admin:
        print("❌ Admin user already exists!")
        print(f"   Username: admin")
        return
    
    # Create admin user
    admin_user = {
        "id": str(uuid.uuid4()),
        "username": "admin",
        "email": "admin@emergency.com",
        "hashed_password": hash_password("admin123"),
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(admin_user)
    
    print("✅ Admin user created successfully!")
    print(f"   Username: admin")
    print(f"   Password: admin123")
    print(f"   Email: admin@emergency.com")
    print(f"   Role: admin")
    print("\n⚠️  Please change the password after first login!")
    
    # Also create a test regular user
    existing_user = await db.users.find_one({"username": "testuser"})
    if not existing_user:
        test_user = {
            "id": str(uuid.uuid4()),
            "username": "testuser",
            "email": "user@test.com",
            "hashed_password": hash_password("test123"),
            "role": "user",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(test_user)
        print("\n✅ Test user created successfully!")
        print(f"   Username: testuser")
        print(f"   Password: test123")
        print(f"   Role: user")
    
    client.close()

if __name__ == "__main__":
    print("Creating admin user...\n")
    asyncio.run(create_admin_user())
