"""Remotive — free public remote-jobs API (no key required)."""

import logging
from typing import List, Dict, Any, Optional
from app.sources.base import BaseSource, clean_text, parse_date, default_deadline

logger = logging.getLogger(__name__)

REMOTIVE_URL = "https://remotive.com/api/remote-jobs"


class RemotiveSource(BaseSource):
    """Remotive free API: remote jobs across categories."""

    def __init__(self):
        super().__init__("Remotive")

    async def fetch_jobs(self, keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Fetch remote job listings. Optionally filter by keyword."""
        opportunities = []
        categories = ["software-dev", "data", "devops-sysadmin", "product", "design"]

        try:
            for category in categories:
                params = {"category": category, "limit": 100}
                response = await self.client.get(REMOTIVE_URL, params=params)
                if response.status_code != 200:
                    logger.warning(f"Remotive category {category} status {response.status_code}")
                    continue

                data = response.json()
                for item in data.get("jobs", []):
                    title = item.get("title", "")
                    if keywords and not any(
                        kw.lower() in title.lower() for kw in keywords if kw
                    ):
                        continue

                    posted = parse_date(item.get("publication_date"))
                    opp = self.create_opportunity(
                        title=title,
                        company=item.get("company_name", "Unknown"),
                        opp_type="JOB",
                        source_id=str(item.get("id", title)),
                        description=clean_text(item.get("description")),
                        short_description=clean_text(item.get("description"))[:280] if item.get("description") else None,
                        location=item.get("candidate_required_location") or "Remote",
                        location_type="Remote",
                        salary=item.get("salary"),
                        url=item.get("url"),
                        skills=[t for t in item.get("tags", []) if t],
                        posted_date=posted,
                        deadline=default_deadline(posted),
                    )
                    opportunities.append(opp)

                logger.info(f"Remotive: {len(data.get('jobs', []))} jobs in {category}")
        except Exception as e:
            logger.error(f"Remotive fetch error: {e}")

        return opportunities

    async def fetch_internships(self, keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Intern-level remote roles (entry-level keyword filter)."""
        jobs = await self.fetch_jobs(keywords=keywords or ["intern", "junior", "entry", "trainee", "graduate", "fresher"])
        for job in jobs:
            job["type"] = "INTERNSHIP"
        return jobs
