"""
Rate limiting middleware for the FastAPI backend.
"""

import time
from typing import Dict, Tuple
from fastapi import Request, HTTPException
from app.core.config import settings


class RateLimiter:
    """Simple in-memory rate limiter."""

    def __init__(self):
        self._requests: Dict[str, list] = {}

    async def check(self, request: Request) -> bool:
        """Check if request is within rate limit."""
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window = 60  # 1 minute window

        if client_ip not in self._requests:
            self._requests[client_ip] = []

        # Clean old entries
        self._requests[client_ip] = [
            t for t in self._requests[client_ip] if now - t < window
        ]

        # Check limit
        if len(self._requests[client_ip]) >= settings.rate_limit_per_minute:
            return False

        self._requests[client_ip].append(now)
        return True


rate_limiter = RateLimiter()


async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting middleware."""
    if not await rate_limiter.check(request):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please try again later.",
        )
    response = await call_next(request)
    return response
