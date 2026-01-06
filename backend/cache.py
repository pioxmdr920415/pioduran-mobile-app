"""
In-memory caching utilities for API responses.
Provides TTL-based caching to reduce database queries.
"""

import asyncio
from functools import wraps
from typing import Any, Callable, Optional
from cachetools import TTLCache
from datetime import datetime
import hashlib
import json


class APICache:
    """Thread-safe in-memory cache with TTL support."""
    
    def __init__(self, maxsize: int = 1000, ttl: int = 300):
        """
        Initialize cache.
        
        Args:
            maxsize: Maximum number of items in cache
            ttl: Time-to-live in seconds (default 5 minutes)
        """
        self._cache = TTLCache(maxsize=maxsize, ttl=ttl)
        self._locks = {}
    
    def _get_lock(self, key: str) -> asyncio.Lock:
        """Get or create a lock for a cache key."""
        if key not in self._locks:
            self._locks[key] = asyncio.Lock()
        return self._locks[key]
    
    def _make_key(self, prefix: str, *args, **kwargs) -> str:
        """Create a cache key from prefix and arguments."""
        key_data = {
            'prefix': prefix,
            'args': args,
            'kwargs': kwargs
        }
        key_str = json.dumps(key_data, sort_keys=True, default=str)
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        return self._cache.get(key)
    
    def set(self, key: str, value: Any) -> None:
        """Set value in cache."""
        self._cache[key] = value
    
    def delete(self, key: str) -> None:
        """Delete value from cache."""
        self._cache.pop(key, None)
    
    def clear(self) -> None:
        """Clear all cache entries."""
        self._cache.clear()
    
    def invalidate_prefix(self, prefix: str) -> None:
        """Invalidate all cache entries with a given prefix."""
        keys_to_delete = [k for k in self._cache.keys() if k.startswith(prefix)]
        for key in keys_to_delete:
            self.delete(key)
    
    @property
    def stats(self) -> dict:
        """Get cache statistics."""
        return {
            'size': len(self._cache),
            'maxsize': self._cache.maxsize,
            'ttl': self._cache.ttl,
            'timestamp': datetime.utcnow().isoformat()
        }


# Global cache instances with different TTLs
# Short-lived cache for frequently changing data (1 minute)
short_cache = APICache(maxsize=500, ttl=60)

# Medium-lived cache for moderately changing data (5 minutes)
medium_cache = APICache(maxsize=1000, ttl=300)

# Long-lived cache for rarely changing data (30 minutes)
long_cache = APICache(maxsize=500, ttl=1800)


def cached(cache: APICache = medium_cache, prefix: str = ""):
    """
    Decorator for caching async function results.
    
    Args:
        cache: Cache instance to use
        prefix: Prefix for cache keys (defaults to function name)
    
    Usage:
        @cached(cache=short_cache, prefix="incidents")
        async def get_incidents():
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Create cache key
            key_prefix = prefix or func.__name__
            cache_key = cache._make_key(key_prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Call function and cache result
            async with cache._get_lock(cache_key):
                # Double-check after acquiring lock
                cached_value = cache.get(cache_key)
                if cached_value is not None:
                    return cached_value
                
                result = await func(*args, **kwargs)
                cache.set(cache_key, result)
                return result
        
        # Attach cache invalidation helper
        wrapper.invalidate = lambda: cache.invalidate_prefix(prefix or func.__name__)
        wrapper.cache = cache
        
        return wrapper
    return decorator


def invalidate_cache(prefix: str, cache: APICache = medium_cache):
    """Invalidate cache entries by prefix."""
    cache.invalidate_prefix(prefix)


def clear_all_caches():
    """Clear all cache instances."""
    short_cache.clear()
    medium_cache.clear()
    long_cache.clear()
