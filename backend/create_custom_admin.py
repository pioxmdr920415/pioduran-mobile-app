"""
Script to create custom admin users
Run this script to add custom admin credentials to MongoDB Atlas
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import uuid
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path
import sys

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def create_custom_admin(username: str, password: str, email: str):
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Check if username already exists
        existing_user = await db.users.find_one({"username": username})
        
        if existing_user:
            print(f"❌ Error: Username '{username}' already exists!")
            print(f"   Please choose a different username.")
            return False
        
        # Create custom admin user
        admin_user = {
            "id": str(uuid.uuid4()),
            "username": username,
            "email": email,
            "hashed_password": hash_password(password),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.users.insert_one(admin_user)
        
        print("✅ Custom admin user created successfully!")
        print(f"   Username: {username}")
        print(f"   Password: {password}")
        print(f"   Email: {email}")
        print(f"   Role: admin")
        print(f"\n🔐 Keep these credentials safe!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return False
    finally:
        client.close()

async def list_all_users():
    """List all users in the database"""
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        users = await db.users.find({}, {"username": 1, "email": 1, "role": 1, "_id": 0}).to_list(100)
        
        if not users:
            print("No users found in database.")
            return
        
        print("\n📋 Current users in database:")
        print("-" * 60)
        for user in users:
            print(f"   Username: {user['username']:<15} | Role: {user['role']:<8} | Email: {user.get('email', 'N/A')}")
        print("-" * 60)
        
    except Exception as e:
        print(f"❌ Error listing users: {e}")
    finally:
        client.close()

def print_usage():
    print("\n📘 Usage:")
    print("   python create_custom_admin.py <username> <password> <email>")
    print("\n📝 Example:")
    print("   python create_custom_admin.py testadmin MySecure123! testadmin@emergency.com")
    print("\n📋 List all users:")
    print("   python create_custom_admin.py --list")
    print()

if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "--list":
        print("Fetching users from MongoDB Atlas...\n")
        asyncio.run(list_all_users())
    elif len(sys.argv) == 4:
        username = sys.argv[1]
        password = sys.argv[2]
        email = sys.argv[3]
        
        print(f"Creating custom admin user in MongoDB Atlas...")
        print(f"Database: {db_name}\n")
        
        success = asyncio.run(create_custom_admin(username, password, email))
        
        if success:
            print("\n✨ Admin user is ready to use!")
            print(f"   Login at: /login")
    else:
        print("\n❌ Invalid arguments!")
        print_usage()
        sys.exit(1)
