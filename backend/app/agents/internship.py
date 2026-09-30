import logging
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.base import BaseAgent, get_user_profile, search_keywords_from_profile
from app.sources.internshala import InternshalaSource
from app.sources.linkedin import LinkedInSource
from app.sources.remotive import RemotiveSource
from app.sources.jobicy import JobicySource
from app.sources.reddit import RedditSource

logger = logging.getLogger(__name__)


class InternshipAgent(BaseAgent):
    """Discovers internship opportunities."""

    def __init__(self):
        super().__init__("InternshipAgent")

    async def execute(self, db: AsyncSession, **kwargs) -> Dict[str, Any]:
        """Fetch and return internship opportunities."""
        await self.start_log(db, "discover_internships", kwargs)

        user_id = kwargs.get("user_id")
        profile = await get_user_profile(db, user_id) if user_id else {}
        keywords = search_keywords_from_profile(profile)
        logger.info(f"Internship discovery keywords: {keywords}")

        all_internships = []
        errors = []

        sources = [
            ("internshala", InternshalaSource()),
            ("linkedin", LinkedInSource()),
            ("remotive", RemotiveSource()),
            ("jobicy", JobicySource()),
            ("reddit", RedditSource()),
        ]

        for name, source in sources:
            try:
                internships = await source.fetch_internships(keywords=keywords)
                all_internships.extend(internships)
                logger.info(f"Found {len(internships)} internships from {name}")
            except Exception as e:
                errors.append({"source": name, "error": str(e)})
                logger.error(f"Error from {name}: {e}")

        result = {
            "opportunities": all_internships,
            "total_count": len(all_internships),
            "errors": errors,
        }

        await self.complete_log(db, output_data=result)
        return result
