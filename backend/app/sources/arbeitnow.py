"""Arbeitnow — free public job-board API (no key required)."""

import logging
from typing import List, Dict, Any, Optional
from app.sources.base import BaseSource, clean_text, parse_date, default_deadline

logger = logging.getLogger(__name__)

ARBEITNOW_URL = "https://www.arbeitnow.com/api/job-board-api"


class ArbeitnowSource(BaseSource):
    """Arbeitnow free API: software/tech jobs (mostly EU + remote)."""

    def __init__(self):
        super().__init__("Arbeitnow")

    async def fetch_jobs(self, keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        opportunities = []
        try:
            response = await self.client.get(ARBEITNOW_URL)
            if response.status_code != 200:
                logger.warning(f"Arbeitnow status {response.status_code}")
                return []

            data = response.json()
            for item in data.get("data", []):
                title = item.get("title", "")
                if keywords and not any(
                    kw.lower() in title.lower() for kw in keywords if kw
                ):
                    continue

                posted = parse_date(item.get("created_at"))
                opp = self.create_opportunity(
                    title=title,
                    company=item.get("company_name", "Unknown"),
                    opp_type="JOB",
                    source_id=str(item.get("slug", title)),
                    description=clean_text(item.get("description")),
                    short_description=clean_text(item.get("description"))[:280] if item.get("description") else None,
                    location=item.get("location", "Remote"),
                    location_type="Remote" if "remote" in str(item.get("location", "")).lower() else "On-site",
                    salary=item.get("salary"),
                    url=item.get("url"),
                    skills=item.get("tags", []),
                    posted_date=posted,
                    deadline=default_deadline(posted),
                )
                opportunities.append(opp)

            logger.info(f"Arbeitnow: {len(data.get('data', []))} jobs")
        except Exception as e:
            logger.error(f"Arbeitnow fetch error: {e}")

        return opportunities
