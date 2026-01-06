import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def create_indexes():
    """Create database indexes for optimal query performance."""
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    try:
        # Users collection indexes
        await db.users.create_index("username", unique=True, name="username_unique")

        # Incident reports collection indexes
        await db.incident_reports.create_index("id", unique=True, name="incident_id_unique")
        await db.incident_reports.create_index("status", name="status_index")
        await db.incident_reports.create_index("priority", name="priority_index")
        await db.incident_reports.create_index("fullName", name="fullName_index")
        await db.incident_reports.create_index("created_at", name="created_at_index")
        # Compound index for status and priority filtering
        await db.incident_reports.create_index([("status", 1), ("priority", 1)], name="status_priority_compound")

        print("Database indexes created successfully")

    except Exception as e:
        print(f"Error creating indexes: {e}")
        raise
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_indexes())