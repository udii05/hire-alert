import logging
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.base import BaseAgent, get_user_profile, search_keywords_from_profile
from app.sources.devpost import DevpostSource
from app.sources.unstop import UnstopSource
from app.sources.github_events import GitHubEventsSource
from app.sources.kaggle import KaggleSource
from app.sources.mlh import MLHSource
from app.sources.reddit import RedditSource

logger = logging.getLogger(__name__)


class HackathonEventAgent(BaseAgent):
    """Discovers hackathons, competitions, tech events, and open-source programs."""

    def __init__(self):
        super().__init__("HackathonEventAgent")

    async def execute(self, db: AsyncSession, **kwargs) -> Dict[str, Any]:
        """Fetch hackathons, events, and competitions from multiple sources."""
        await self.start_log(db, "discover_hackathons_events", kwargs)

        user_id = kwargs.get("user_id")
        profile = await get_user_profile(db, user_id) if user_id else {}
        keywords = search_keywords_from_profile(profile)
        logger.info(f"Event discovery keywords: {keywords}")

        all_opportunities = []
        errors = []

        sources = [
            ("devpost", DevpostSource()),
            ("unstop", UnstopSource()),
            ("kaggle", KaggleSource()),
            ("mlh", MLHSource()),
            ("github", GitHubEventsSource()),
            ("reddit", RedditSource()),
        ]

        for name, source in sources:
            try:
                opportunities = await source.fetch_hackathons()
                all_opportunities.extend(opportunities)
                logger.info(f"Found {len(opportunities)} events from {name}")
            except Exception as e:
                errors.append({"source": name, "error": str(e)})
                logger.error(f"Error from {name}: {e}")

        result = {
            "opportunities": all_opportunities,
            "total_count": len(all_opportunities),
            "errors": errors,
        }

        await self.complete_log(db, output_data=result)
        return result
