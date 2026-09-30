import logging
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.base import BaseAgent, get_user_profile, search_keywords_from_profile
from app.sources.reddit import RedditSource
from app.sources.wellfound import WellfoundSource

logger = logging.getLogger(__name__)


class FreelancingAgent(BaseAgent):
    """Discovers freelance gigs and contract work."""

    def __init__(self):
        super().__init__("FreelancingAgent")

    async def execute(self, db: AsyncSession, **kwargs) -> Dict[str, Any]:
        """Fetch and return freelancing opportunities."""
        await self.start_log(db, "discover_freelancing", kwargs)

        user_id = kwargs.get("user_id")
        profile = await get_user_profile(db, user_id) if user_id else {}
        keywords = search_keywords_from_profile(profile)

        all_gigs = []
        errors = []

        sources = [
            ("reddit", RedditSource()),
            ("wellfound", WellfoundSource()),
        ]

        for name, source in sources:
            try:
                gigs = await source.fetch_freelancing(keywords=keywords)
                all_gigs.extend(gigs)
                logger.info(f"Found {len(gigs)} gigs from {name}")
            except Exception as e:
                errors.append({"source": name, "error": str(e)})
                logger.error(f"Error from {name}: {e}")

        result = {
            "opportunities": all_gigs,
            "total_count": len(all_gigs),
            "errors": errors,
        }

        await self.complete_log(db, output_data=result)
        return result
