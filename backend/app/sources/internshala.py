"""Internshala — public internship/job listings (best-effort).

Internshala frontend loads listings from a JSON API. We attempt the public
endpoint; if the anti-bot layer blocks us, the source degrades gracefully.
"""

import logging
from typing import List, Dict, Any, Optional
from app.sources.base import BaseSource, clean_text, parse_date, default_deadline

logger = logging.getLogger(__name__)

INTERNSHALA_JOBS = "https://internshala.com/jobs"
INTERNSHALA_INTERNSHIPS = "https://internshala.com/internships"


class InternshalaSource(BaseSource):
    """Internshala source adapter for internships and jobs."""

    def __init__(self):
        super().__init__("Internshala")

    async def fetch_internships(self, keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Fetch internship listings from Internshala's public search page."""
        opportunities = []
        search_terms = keywords or ["computer science", "data science", "web development", "marketing"]

        try:
            for keyword in search_terms[:3]:
                response = await self.client.get(
                    INTERNSHALA_INTERNSHIPS,
                    params={"q": keyword},
                )
                if response.status_code != 200:
                    logger.warning(f"Internshala status {response.status_code}")
                    continue

                # Internshala embeds structured data; parse the internship cards.
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(response.text, "lxml")
                for card in soup.select(".internship_list_container .internship_meta"):
                    try:
                        title_el = card.select_one(".internship__title")
                        if not title_el:
                            continue
                        title = title_el.get_text(strip=True)
                        company_el = card.select_one(".company_name")
                        company = company_el.get_text(strip=True) if company_el else "Internshala"
                        link_el = card.select_one("a")
                        href = link_el.get("href") if link_el else None
                        location_el = card.select_one(".locations span")
                        location = location_el.get_text(strip=True) if location_el else None
                        stipend_el = card.select_one(".stipend")
                        stipend = stipend_el.get_text(strip=True) if stipend_el else None

                        job_id = href.split("/")[-1] if href else title
                        opp = self.create_opportunity(
                            title=title,
                            company=company,
                            opp_type="INTERNSHIP",
                            source_id=job_id,
                            location=location,
                            location_type="On-site" if location else "Remote",
                            stipend=stipend,
                            url=f"https://internshala.com{href}" if href else None,
                            posted_date=None,
                            deadline=default_deadline(),
                        )
                        opportunities.append(opp)
                    except Exception:
                        continue

                logger.info(f"Internshala: {len(opportunities)} internships for '{keyword}'")
        except Exception as e:
            logger.error(f"Internshala internships fetch error: {e}")

        return opportunities

    async def fetch_jobs(self, keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Fetch job listings from Internshala's public jobs page."""
        opportunities = []
        try:
            response = await self.client.get(INTERNSHALA_JOBS)
            if response.status_code != 200:
                logger.warning(f"Internshala jobs status {response.status_code}")
                return []

            from bs4 import BeautifulSoup
            soup = BeautifulSoup(response.text, "lxml")
            for card in soup.select(".internship_list_container .internship_meta"):
                try:
                    title_el = card.select_one(".internship__title")
                    if not title_el:
                        continue
                    title = title_el.get_text(strip=True)
                    company_el = card.select_one(".company_name")
                    company = company_el.get_text(strip=True) if company_el else "Internshala"
                    link_el = card.select_one("a")
                    href = link_el.get("href") if link_el else None

                    opp = self.create_opportunity(
                        title=title,
                        company=company,
                        opp_type="JOB",
                        source_id=href.split("/")[-1] if href else title,
                        location=None,
                        url=f"https://internshala.com{href}" if href else None,
                        posted_date=None,
                        deadline=default_deadline(),
                    )
                    opportunities.append(opp)
                except Exception:
                    continue

            logger.info(f"Internshala: {len(opportunities)} jobs")
        except Exception as e:
            logger.error(f"Internshala jobs fetch error: {e}")

        return opportunities
