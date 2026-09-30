import logging
from typing import List, Dict, Any
from app.sources.base import BaseSource

logger = logging.getLogger(__name__)


class WellfoundSource(BaseSource):
    """
    Wellfound (formerly AngelList) source adapter for startup jobs
    and freelancing opportunities.
    """

    def __init__(self):
        super().__init__("Wellfound")

    async def fetch_jobs(self) -> List[Dict[str, Any]]:
        """Fetch startup job listings from Wellfound."""
        opportunities = []

        try:
            # Wellfound API (requires API key)
            url = "https://api.angel.co/1/jobs"
            response = await self.client.get(url)

            if response.status_code == 200:
                data = response.json()
                for item in data.get("jobs", []):
                    opp = self.create_opportunity(
                        title=item.get("title", "Startup Job"),
                        company=item.get("startup", {}).get("name", "Startup"),
                        opp_type="JOB",
                        source_id=str(item.get("id", "")),
                        description=item.get("description"),
                        location=item.get("location", {}).get("display_name"),
                        salary=item.get("salary", {}).get("range"),
                        url=item.get("url"),
                        skills=[s.get("name") for s in item.get("tags", [])],
                    )
                    opportunities.append(opp)
                logger.info(f"Wellfound: found {len(opportunities)} jobs")
            else:
                logger.warning(f"Wellfound returned status {response.status_code}")

        except Exception as e:
            logger.error(f"Wellfound fetch error: {e}")

        return opportunities

    async def fetch_freelancing(self) -> List[Dict[str, Any]]:
        """Fetch freelancing/contract opportunities from Wellfound."""
        opportunities = []
        try:
            url = "https://api.angel.co/1/tags/freelance"
            response = await self.client.get(url)
            if response.status_code == 200:
                logger.info("Wellfound: fetched freelance page")
        except Exception as e:
            logger.error(f"Wellfound freelance fetch error: {e}")
        return opportunities
