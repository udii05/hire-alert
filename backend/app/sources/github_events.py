"""GitHub — open-source opportunities via the public API (good-first-issue repos)."""

import logging
from typing import List, Dict, Any, Optional
from app.sources.base import BaseSource, clean_text, parse_date, default_deadline

logger = logging.getLogger(__name__)

SEARCH_REPOS = "https://api.github.com/search/repositories"


class GitHubEventsSource(BaseSource):
    """GitHub open-source programs and beginner-friendly projects (public API)."""

    def __init__(self):
        super().__init__("GitHub")

    async def fetch_hackathons(self) -> List[Dict[str, Any]]:
        """Open-source contribution opportunities (good-first-issue repos)."""
        opportunities = []
        try:
            response = await self.client.get(
                SEARCH_REPOS,
                params={
                    "q": "good-first-issues:>3 stars:>200",
                    "sort": "updated",
                    "per_page": 30,
                },
            )
            if response.status_code != 200:
                logger.warning(f"GitHub API status {response.status_code}")
                return []

            for item in response.json().get("items", []):
                pushed = parse_date(item.get("pushed_at"))
                opp = self.create_opportunity(
                    title=f"Contribute to {item.get('name', 'Open Source Project')}",
                    company=item.get("owner", {}).get("login", "GitHub"),
                    opp_type="OPEN_SOURCE",
                    source_id=item.get("full_name", item.get("name", "")),
                    description=clean_text(item.get("description")) or "Open-source contribution opportunity",
                    short_description=clean_text(item.get("description")),
                    url=item.get("html_url"),
                    location="Remote",
                    location_type="Remote",
                    skills=item.get("topics") or [item.get("language")] if item.get("language") else [],
                    posted_date=pushed,
                    deadline=default_deadline(pushed),
                )
                opportunities.append(opp)

            logger.info(f"GitHub: {len(opportunities)} open-source opportunities")
        except Exception as e:
            logger.error(f"GitHub open-source fetch error: {e}")

        return opportunities

    async def fetch_jobs(self, keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """GitHub Careers is not API-accessible; open-source roles serve this slot."""
        return await self.fetch_hackathons()
