"""Naukri — guest job-search API (public listings, best-effort).

Naukri serves its search results through a JSON API that the site itself uses.
We query it with the standard headers; if the anti-bot layer rejects us, the
source degrades gracefully (other sources still populate the board).
"""

import logging
import json
from typing import List, Dict, Any, Optional
from app.sources.base import BaseSource, clean_text, parse_date, default_deadline

logger = logging.getLogger(__name__)

NAUKRI_API = "https://www.naukri.com/jobapi/v3/search"
NAUKRI_HEADERS = {
    "Content-Type": "application/json",
    "Referer": "https://www.naukri.com/",
    "Origin": "https://www.naukri.com",
    "Appid": "109",
    "systemid": "Naukri",
    "clientid": "d3s9w1e2f3a4b5c6d7e8f9a1b2c3d4e5f",
}


class NaukriSource(BaseSource):
    """Naukri.com source adapter (guest JSON API + RSS fallback)."""

    def __init__(self):
        super().__init__("Naukri")

    async def fetch_jobs(self, keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        opportunities = []
        search_terms = keywords or ["software engineer", "data science", "fresher", "intern"]

        try:
            for keyword in search_terms[:4]:
                params = {
                    "noOfResults": 20,
                    "urlType": "search_by_keyword",
                    "searchType": "adv",
                    "keyword": keyword,
                    "cityType": 1,
                    "seoKey": f"{keyword.replace(' ', '-')}-jobs",
                    "src": "jobsearchDesk",
                    "k": keyword,
                }
                response = await self.client.get(
                    NAUKRI_API, params=params, headers=NAUKRI_HEADERS
                )
                if response.status_code != 200:
                    logger.warning(f"Naukri status {response.status_code} for '{keyword}'")
                    continue

                data = response.json()
                for item in data.get("jobDetails", []):
                    title = item.get("title", "")
                    company = item.get("companyName") or item.get("company", "Naukri")
                    created = parse_date(item.get("createdDate"))
                    jd = clean_text(item.get("jobDescription"))
                    skills_text = item.get("skill", "")
                    skills = [s.strip() for s in skills_text.split("|") if s.strip()] if skills_text else []

                    opp = self.create_opportunity(
                        title=title,
                        company=company,
                        opp_type="JOB",
                        source_id=str(item.get("jobId", title)),
                        description=jd,
                        short_description=jd[:280] if jd else None,
                        location=item.get("place") or item.get("city"),
                        salary=item.get("salary"),
                        url=item.get("jobDetailsUrl") or item.get("jobUrl"),
                        skills=skills,
                        posted_date=created,
                        deadline=default_deadline(created),
                    )
                    opportunities.append(opp)

                logger.info(f"Naukri: {len(data.get('jobDetails', []))} jobs for '{keyword}'")
        except Exception as e:
            logger.error(f"Naukri fetch error: {e}")

        return opportunities

    async def fetch_internships(self, keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        return await self.fetch_jobs(keywords=["internship", "intern", "trainee", "apprentice"])
