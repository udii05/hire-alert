import logging
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.base import BaseAgent, get_user_profile, search_keywords_from_profile
from app.sources.base import SourceRegistry
from app.sources.linkedin import LinkedInSource
from app.sources.naukri import NaukriSource
from app.sources.remotive import RemotiveSource
from app.sources.jobicy import JobicySource
from app.sources.arbeitnow import ArbeitnowSource
from app.sources.internshala import InternshalaSource

logger = logging.getLogger(__name__)


class JobDiscoveryAgent(BaseAgent):
    """Discovers job opportunities from multiple sources (API-first)."""

    def __init__(self):
        super().__init__("JobDiscoveryAgent")
        self.sources = SourceRegistry()
        self._register_sources()

    def _register_sources(self):
        self.sources.register("linkedin", LinkedInSource())
        self.sources.register("naukri", NaukriSource())
        self.sources.register("remotive", RemotiveSource())
        self.sources.register("jobicy", JobicySource())
        self.sources.register("arbeitnow", ArbeitnowSource())
        self.sources.register("internshala", InternshalaSource())

    async def execute(self, db: AsyncSession, **kwargs) -> Dict[str, Any]:
        """Discover job opportunities from all registered sources."""
        await self.start_log(db, "discover_jobs", kwargs)

        user_id = kwargs.get("user_id")
        profile = await get_user_profile(db, user_id) if user_id else {}
        keywords = search_keywords_from_profile(profile)
        logger.info(f"Job discovery keywords: {keywords}")

        all_opportunities = []
        errors = []

        for source_name in self.sources.list_sources():
            try:
                source = self.sources.get(source_name)
                opportunities = await source.fetch_jobs(keywords=keywords)
                all_opportunities.extend(opportunities)
                logger.info(f"Found {len(opportunities)} jobs from {source_name}")
            except Exception as e:
                errors.append({"source": source_name, "error": str(e)})
                logger.error(f"Error fetching from {source_name}: {e}")

        result = {
            "opportunities": all_opportunities,
            "total_count": len(all_opportunities),
            "sources_used": self.sources.list_sources(),
            "errors": errors,
        }

        await self.complete_log(db, output_data=result)
        return result
