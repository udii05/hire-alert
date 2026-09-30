"""
Redis caching service for opportunity data and agent results.
"""

import json
import logging
from typing import Optional, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

try:
    import redis.asyncio as aioredis

    redis_client = aioredis.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True,
    )
    REDIS_AVAILABLE = True
except ImportError:
    redis_client = None
    REDIS_AVAILABLE = False
    logger.warning("Redis not available. Using in-memory fallback.")


class InMemoryCache:
    """Simple in-memory cache fallback when Redis is unavailable."""

    def __init__(self):
        self._cache: dict = {}

    async def get(self, key: str) -> Optional[str]:
        return self._cache.get(key)

    async def set(self, key: str, value: str, ex: Optional[int] = None):
        self._cache[key] = value

    async def delete(self, key: str):
        self._cache.pop(key, None)

    async def exists(self, key: str) -> bool:
        return key in self._cache


if REDIS_AVAILABLE:
    cache = redis_client
else:
    cache = InMemoryCache()  # type: ignore


async def get_cached(key: str) -> Optional[Any]:
    """Get a value from cache."""
    try:
        value = await cache.get(key)
        if value:
            return json.loads(value)
        return None
    except Exception as e:
        logger.error(f"Cache get error: {e}")
        return None


async def set_cached(key: str, value: Any, ttl: int = 300):
    """Set a value in cache with TTL."""
    try:
        await cache.set(key, json.dumps(value), ex=ttl)
    except Exception as e:
        logger.error(f"Cache set error: {e}")


async def delete_cached(key: str):
    """Delete a value from cache."""
    try:
        await cache.delete(key)
    except Exception as e:
        logger.error(f"Cache delete error: {e}")


async def invalidate_user_cache(user_id: str):
    """Invalidate all cache entries for a specific user."""
    try:
        pattern = f"user:{user_id}:*"
        if REDIS_AVAILABLE:
            keys = await cache.keys(pattern)
            for key in keys:
                await cache.delete(key)
    except Exception as e:
        logger.error(f"Cache invalidation error: {e}")


async def cache_opportunities(user_id: str, opportunities: list, ttl: int = 300):
    """Cache recommended opportunities for a user."""
    key = f"user:{user_id}:opportunities"
    await set_cached(key, opportunities, ttl)


async def get_cached_opportunities(user_id: str) -> Optional[list]:
    """Get cached opportunities for a user."""
    key = f"user:{user_id}:opportunities"
    return await get_cached(key)
