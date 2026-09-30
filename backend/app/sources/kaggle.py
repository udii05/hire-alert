"""Kaggle — competitions (public API with optional credentials, HTML fallback)."""

import logging
from typing import List, Dict, Any
from bs4 import BeautifulSoup
from app.sources.base import BaseSource, clean_text, parse_date, default_deadline
from app.core.config import settings

logger = logging.getLogger(__name__)

KAGGLE_API = "https://www.kaggle.com/api/v1/competitions/list"
KAGGLE_HTML = "https://www.kaggle.com/competitions"


class KaggleSource(BaseSource):
    """Kaggle competitions source adapter."""

    def __init__(self):
        super().__init__("Kaggle")

    async def fetch_hackathons(self) -> List[Dict[str, Any]]:
        opportunities = []
        try:
            headers = {}
            if settings.kaggle_username and settings.kaggle_key:
                import base64
                token = base64.b64encode(
                    f"{settings.kaggle_username}:{settings.kaggle_key}".encode()
                ).decode()
                headers["Authorization"] = f"Basic {token}"

            response = await self.client.get(KAGGLE_API, headers=headers)
            if response.status_code != 200:
                logger.warning(f"Kaggle API status {response.status_code}, trying HTML fallback")
                return await self._scrape_competitions()

            for item in response.json():
                deadline = parse_date(item.get("deadline"))
                opp = self.create_opportunity(
                    title=item.get("title", "Kaggle Competition"),
                    company="Kaggle",
                    opp_type="COMPETITION",
                    source_id=str(item.get("ref") or item.get("id", item.get("title"))),
                    description=clean_text(item.get("description")),
                    short_description=clean_text(item.get("subtitle")),
                    url=f"https://www.kaggle.com/competitions/{item.get('ref')}" if item.get("ref") else None,
                    skills=item.get("category", "").replace("_", " ").split(",") if item.get("category") else [],
                    deadline=deadline or default_deadline(),
                    posted_date=parse_date(item.get("enabledDate")),
                )
                opportunities.append(opp)

            logger.info(f"Kaggle: {len(opportunities)} competitions via API")
        except Exception as e:
            logger.error(f"Kaggle API error: {e}")
            try:
                opportunities = await self._scrape_competitions()
            except Exception as scrape_error:
                logger.error(f"Kaggle scrape fallback failed: {scrape_error}")

        return opportunities

    async def _scrape_competitions(self) -> List[Dict[str, Any]]:
        """Fallback: parse the public competitions listing page."""
        opportunities = []
        response = await self.client.get(KAGGLE_HTML)
        if response.status_code != 200:
            logger.warning(f"Kaggle HTML status {response.status_code}")
            return []

        soup = BeautifulSoup(response.text, "lxml")
        for link in soup.select("a[href*='/competitions/']"):
            href = link.get("href", "")
            if not href.startswith("/competitions/") or href == "/competitions/":
                continue
            slug = href.rsplit("/", 1)[-1]
            if len(slug) < 2 or slug in ("competitions", "all", "list"):
                continue
            title = clean_text(link.get_text()) or slug.replace("-", " ").title()
            opp = self.create_opportunity(
                title=title,
                company="Kaggle",
                opp_type="COMPETITION",
                source_id=slug,
                url=f"https://www.kaggle.com{href}",
                deadline=default_deadline(),
            )
            opportunities.append(opp)

        logger.info(f"Kaggle: {len(opportunities)} competitions via scrape")
        return opportunities
