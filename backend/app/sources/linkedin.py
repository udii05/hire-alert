"""LinkedIn Jobs — guest search API (public listings, no scraping of profiles)."""

import logging
import re
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup
from app.sources.base import BaseSource, clean_text, parse_date, default_deadline

logger = logging.getLogger(__name__)

SEARCH_URL = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"


class LinkedInSource(BaseSource):
    """LinkedIn Jobs via LinkedIn's own guest search endpoint (public HTML)."""

    def __init__(self):
        super().__init__("LinkedIn")

    def _build_queries(self, keywords: Optional[List[str]]) -> List[str]:
        base = keywords or ["software engineer", "data science", "intern"]
        queries = []
        for kw in base[:6]:
            queries.append({"keywords": kw, "location": "India"})
        if not any("intern" in q["keywords"].lower() for q in queries):
            queries.append({"keywords": "intern", "location": "India"})
        return queries

    async def fetch_jobs(self, keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Fetch public job postings from LinkedIn guest search."""
        opportunities = []
        seen_ids = set()

        for query in self._build_queries(keywords):
            try:
                response = await self.client.get(SEARCH_URL, params=query)
                if response.status_code != 200:
                    logger.warning(f"LinkedIn status {response.status_code} for {query['keywords']}")
                    continue

                soup = BeautifulSoup(response.text, "lxml")
                cards = soup.select("div.base-search-card")
                for card in cards:
                    try:
                        title_el = card.select_one("h3.base-search-card__title")
                        title = title_el.get_text(strip=True) if title_el else None
                        link = card.select_one("a.base-card__full-link")
                        href = link.get("href") if link else None
                        if not title or not href:
                            continue

                        job_id_match = re.search(r"/jobs/view/(?:[^?/-]+-)?(\d+)", href)
                        job_id = job_id_match.group(1) if job_id_match else href.split("?")[0]
                        if job_id in seen_ids:
                            continue
                        seen_ids.add(job_id)

                        company_el = card.select_one("h4.base-search-card__subtitle a")
                        company = company_el.get_text(strip=True) if company_el else "LinkedIn"
                        loc_el = card.select_one(".job-search-card__location")
                        location = loc_el.get_text(strip=True) if loc_el else None
                        date_el = card.select_one("time")
                        posted = parse_date(date_el.get("datetime")) if date_el and date_el.get("datetime") else None

                        opp = self.create_opportunity(
                            title=title,
                            company=company,
                            opp_type="JOB",
                            source_id=job_id,
                            location=location or "India",
                            location_type="Remote" if location and "remote" in location.lower() else "On-site",
                            url=href.split("?")[0],
                            posted_date=posted,
                            deadline=default_deadline(posted),
                        )
                        opportunities.append(opp)
                    except Exception as e:
                        logger.debug(f"LinkedIn card parse error: {e}")
                        continue

                logger.info(f"LinkedIn: {len(cards)} jobs for {query['keywords']}")
            except Exception as e:
                logger.error(f"LinkedIn fetch error for {query}: {e}")

        return opportunities

    async def fetch_internships(self, keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        jobs = await self.fetch_jobs(keywords=keywords or ["intern", "internship", "trainee", "fresher"])
        for job in jobs:
            job["type"] = "INTERNSHIP"
        return jobs
