"""Reddit — public JSON API for job/freelance/hackathon subreddits."""

import logging
from typing import List, Dict, Any, Optional
import httpx
from app.sources.base import BaseSource, clean_text, parse_date, default_deadline

logger = logging.getLogger(__name__)

REDDIT_JSON = "https://www.reddit.com/r/{sub}/new.json"

SUBREDDITS = {
    "forhire": "FREELANCING",
    "jobbit": "JOB",
    "InternshipIndia": "INTERNSHIP",
    "hackathons": "HACKATHON",
}


class RedditSource(BaseSource):
    """Reddit listings via the public JSON endpoint (read-only, no auth)."""

    def __init__(self):
        super().__init__("Reddit")
        # Reddit's TLS chain trips some Windows CA stores; public read-only data.
        self.client = httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True,
            verify=False,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json",
            },
        )

    async def _fetch_sub(self, sub: str, opp_type: str, keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        opportunities = []
        try:
            response = await self.client.get(
                REDDIT_JSON.format(sub=sub), params={"limit": 50}
            )
            if response.status_code != 200:
                logger.warning(f"Reddit r/{sub} status {response.status_code}")
                return []

            data = response.json()
            for child in data.get("data", {}).get("children", []):
                post = child.get("data", {})
                title = post.get("title", "")
                body = clean_text(post.get("selftext"))
                url = f"https://www.reddit.com{post.get('permalink', '')}"
                posted = parse_date(post.get("created_utc"))

                if keywords and not any(
                    kw.lower() in title.lower() for kw in keywords if kw
                ):
                    continue

                opp = self.create_opportunity(
                    title=title,
                    company=f"r/{sub}",
                    opp_type=opp_type,
                    source_id=str(post.get("id", title)),
                    description=body,
                    short_description=(body[:280] if body else None),
                    url=url,
                    location="Remote/Online",
                    location_type="Remote",
                    posted_date=posted,
                    deadline=default_deadline(posted),
                )
                opportunities.append(opp)

            logger.info(f"Reddit r/{sub}: {len(opportunities)} posts")
        except Exception as e:
            logger.error(f"Reddit r/{sub} fetch error: {e}")

        return opportunities

    async def fetch_jobs(self, keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        return await self._fetch_sub("jobbit", "JOB", keywords)

    async def fetch_freelancing(self, keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        return await self._fetch_sub("forhire", "FREELANCING", keywords)

    async def fetch_internships(self, keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        return await self._fetch_sub("InternshipIndia", "INTERNSHIP", keywords)

    async def fetch_hackathons(self, keywords: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        return await self._fetch_sub("hackathons", "HACKATHON", keywords)
