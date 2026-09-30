"""Jobicy — free public remote-jobs API (no key required)."""

import logging
from typing import List, Dict, Any, Optional
from app.sources.base import BaseSource, clean_text, parse_date, default_deadline

logger = logging.getLogger(__name__)

JOBICY_URL = "https://jobicy.com/api/v2/remote-jobs"


class JobicySource(BaseSource):
    """Jobicy free API: remote jobs with skills lists."""

    def __init__(self):
        super().__init__("Jobicy")

    async def fetch_jobs(self, keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        opportunities = []
        industries = ["technology", "data-science", "engineering", "product", "design"]

        try:
            for industry in industries:
                params = {"count": 50, "industry": industry}
                response = await self.client.get(JOBICY_URL, params=params)
                if response.status_code != 200:
                    continue

                data = response.json()
                for item in data.get("jobs", []):
                    title = item.get("jobTitle", "")
                    if keywords and not any(
                        kw.lower() in title.lower() for kw in keywords if kw
                    ):
                        continue

                    posted = parse_date(item.get("publishDate"))
                    skills = item.get("jobSkills") or []
                    opp = self.create_opportunity(
                        title=title,
                        company=item.get("companyName", "Unknown"),
                        opp_type="JOB",
                        source_id=str(item.get("id", title)),
                        description=clean_text(item.get("jobDescription")),
                        short_description=clean_text(item.get("jobExcerpt")) if item.get("jobExcerpt") else None,
                        location=item.get("jobLocation") or "Remote",
                        location_type="Remote",
                        salary=item.get("annualSalaryMin"),
                        url=item.get("url"),
                        skills=[s.get("name") if isinstance(s, dict) else s for s in skills],
                        posted_date=posted,
                        deadline=default_deadline(posted),
                    )
                    opportunities.append(opp)

                logger.info(f"Jobicy: {len(data.get('jobs', []))} jobs in {industry}")
        except Exception as e:
            logger.error(f"Jobicy fetch error: {e}")

        return opportunities

    async def fetch_internships(self, keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        jobs = await self.fetch_jobs(keywords=keywords or ["intern", "junior", "entry", "trainee", "graduate", "fresher"])
        for job in jobs:
            job["type"] = "INTERNSHIP"
        return jobs
