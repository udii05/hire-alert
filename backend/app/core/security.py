"""Shared security dependencies for API authentication."""

import hmac

from fastapi import Header, HTTPException

from app.core.config import settings


async def verify_api_key(x_api_key: str = Header(None)):
    """Validate the X-API-Key header using a constant-time comparison."""
    if not x_api_key or not hmac.compare_digest(
        x_api_key.encode(), settings.backend_api_key.encode()
    ):
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True
