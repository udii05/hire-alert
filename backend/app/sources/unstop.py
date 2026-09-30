"""Unstop — hackathons, competitions & scholarships (public API, best-effort)."""

import logging
from typing import List, Dict, Any
from app.sources.base import BaseSource, clean_text, parse_date, default_deadline

logger = logging.getLogger(__name__)

UNSTOP_COMPETITIONS = "https://unstop.com/api/public/opportunity/search-result"
UNSTOP_SCHOLARSHIPS = "https://unstop.com/api/public/opportunity/search-result"


class UnstopSource(BaseSource):
    """Unstop (formerly Dare2Compete) — competitions, hackathons, scholarships."""

    def __init__(self):
        super().__init__("Unstop")

    async def _fetch_listing(self, opp_type: str, label: str) -> List[Dict[str, Any]]:
        opportunities = []
        try:
            response = await self.client.get(
                UNSTOP_COMPETITIONS,
                params={"opportunity_type": opp_type, "page": 1, "per_page": 30},
            )
            if response.status_code != 200:
                logger.warning(f"Unstop {label} status {response.status_code}")
                return []

            data = response.json()
            payload = data.get("data") or data
            items = payload if isinstance(payload, list) else payload.get("data", [])
            if isinstance(items, dict):
                items = items.get("data", [])

            for item in items:
                title = item.get("title") or item.get("name")
                if not title:
                    continue
                deadline = parse_date(item.get("deadline") or item.get("end_date"))
                opp = self.create_opportunity(
                    title=title,
                    company=item.get("organizer") or item.get("hosted_by") or "Unstop",
                    opp_type="HACKATHON" if opp_type == "competitions" else "SCHOLARSHIP",
                    source_id=str(item.get("id") or item.get("slug") or title),
                    description=clean_text(item.get("description")),
                    short_description=clean_text(item.get("subtitle")),
                    url=item.get("url") or item.get("opportunity_url"),
                    skills=item.get("tags") or [],
                    deadline=deadline or default_deadline(),
                    posted_date=parse_date(item.get("start_date")),
                )
                opportunities.append(opp)

            logger.info(f"Unstop: {len(opportunities)} {label}")
        except Exception as e:
            logger.error(f"Unstop {label} fetch error: {e}")

        return opportunities

    async def fetch_hackathons(self) -> List[Dict[str, Any]]:
        return await self._fetch_listing("competitions", "competitions")

    async def fetch_scholarships(self) -> List[Dict[str, Any]]:
        return await self._fetch_listing("scholarships", "scholarships")
