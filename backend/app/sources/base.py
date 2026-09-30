import logging
import re
from typing import List, Dict, Any, Optional
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


def clean_text(value: Optional[str]) -> Optional[str]:
    """Strip HTML tags and collapse whitespace."""
    if not value:
        return None
    text = re.sub(r"<[^>]+>", " ", str(value))
    text = re.sub(r"\s+", " ", text).strip()
    return text or None


def parse_date(value) -> Optional[datetime]:
    """Parse a date string into a naive UTC datetime, or return None."""
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        dt = value
    else:
        from dateutil import parser as date_parser
        try:
            dt = date_parser.parse(str(value))
        except Exception:
            return None
    if dt.tzinfo is not None:
        dt = dt.astimezone().replace(tzinfo=None)
    return dt


def default_deadline(posted: Optional[datetime] = None) -> Optional[datetime]:
    """
    Sources without explicit deadlines get a sensible default:
    posted date + default_deadline_days (or now + default_deadline_days).
    """
    base = posted or datetime.utcnow()
    return base + timedelta(days=settings.default_deadline_days)


class BaseSource(ABC):
    """Abstract base class for all opportunity sources."""

    def __init__(self, name: str):
        self.name = name
        self.client = httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True,
            headers={
                "User-Agent": settings.user_agent,
                "Accept": "text/html,application/json,*/*",
            },
        )

    async def fetch_jobs(self) -> List[Dict[str, Any]]:
        """Fetch job opportunities from this source. Override if applicable."""
        return []

    async def fetch_internships(self) -> List[Dict[str, Any]]:
        """Fetch internship opportunities from this source. Override if applicable."""
        return []

    async def fetch_hackathons(self) -> List[Dict[str, Any]]:
        """Fetch hackathon/event opportunities. Override if applicable."""
        return []

    async def fetch_scholarships(self) -> List[Dict[str, Any]]:
        """Fetch scholarship opportunities. Override if applicable."""
        return []

    async def fetch_freelancing(self) -> List[Dict[str, Any]]:
        """Fetch freelancing opportunities. Override if applicable."""
        return []

    def create_opportunity(
        self,
        title: str,
        company: str,
        opp_type: str,
        source_id: str,
        **kwargs,
    ) -> Dict[str, Any]:
        """Create a standardized opportunity dictionary (Prisma-compatible keys)."""
        return {
            "title": title,
            "company": company,
            "type": opp_type,
            "source": self.name,
            "sourceId": source_id,
            "description": kwargs.get("description"),
            "shortDescription": kwargs.get("short_description"),
            "location": kwargs.get("location"),
            "locationType": kwargs.get("location_type", "On-site"),
            "salary": kwargs.get("salary"),
            "stipend": kwargs.get("stipend"),
            "currency": kwargs.get("currency", "INR"),
            "experienceLevel": kwargs.get("experience_level", "ANY"),
            "deadline": kwargs.get("deadline"),
            "postedDate": kwargs.get("posted_date"),
            "url": kwargs.get("url"),
            "skills": kwargs.get("skills", []),
            "eligibility": kwargs.get("eligibility"),
            "responsibilities": kwargs.get("responsibilities", []),
            "isActive": True,
        }

    async def close(self):
        await self.client.aclose()


class SourceRegistry:
    """Registry for managing all opportunity sources."""

    def __init__(self):
        self._sources: Dict[str, BaseSource] = {}

    def register(self, name: str, source: BaseSource):
        self._sources[name] = source

    def get(self, name: str) -> Optional[BaseSource]:
        return self._sources.get(name)

    def list_sources(self) -> List[str]:
        return list(self._sources.keys())

    def unregister(self, name: str):
        self._sources.pop(name, None)
