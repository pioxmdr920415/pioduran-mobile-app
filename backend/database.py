"""
Centralized database connection module.
Provides a single shared MongoDB client for all routes to prevent connection pool exhaustion.
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection settings
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']

# Single shared client with optimized connection pool
_client = None
_db = None


def get_client() -> AsyncIOMotorClient:
    """Get the shared MongoDB client instance."""
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(
            MONGO_URL,
            maxPoolSize=50,  # Maximum connections in pool
            minPoolSize=10,  # Minimum connections to maintain
            maxIdleTimeMS=30000,  # Close idle connections after 30s
            connectTimeoutMS=5000,  # Connection timeout
            serverSelectionTimeoutMS=5000,  # Server selection timeout
            retryWrites=True,
            retryReads=True,
        )
    return _client


def get_database():
    """Get the shared database instance."""
    global _db
    if _db is None:
        _db = get_client()[DB_NAME]
    return _db


async def close_client():
    """Close the MongoDB client connection."""
    global _client, _db
    if _client is not None:
        _client.close()
        _client = None
        _db = None


# Convenience exports
db = get_database()
client = get_client()
