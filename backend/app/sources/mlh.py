"""MLH — Major League Hacking events (public HTML scrape with schema.org data)."""

import logging
from typing import List, Dict, Any
from bs4 import BeautifulSoup
from app.sources.base import BaseSource, clean_text, parse_date, default_deadline

logger = logging.getLogger(__name__)

MLH_URL = "https://www.mlh.com/seasons/{season}/events"


class MLHSource(BaseSource):
    """MLH upcoming hackathons (schema.org markup on the public schedule)."""

    def __init__(self):
        super().__init__("MLH")

    async def fetch_hackathons(self) -> List[Dict[str, Any]]:
        opportunities = []
        year = _current_mlh_year()
        seasons = [str(year), str(year - 1)]

        try:
            for season in seasons:
                url = MLH_URL.format(season=season)
                response = await self.client.get(url)
                if response.status_code != 200:
                    logger.warning(f"MLH season {season} status {response.status_code}")
                    continue

                soup = BeautifulSoup(response.text, "lxml")
                cards = soup.select("a[href*='events.mlh.io/events']")
                for card in cards:
                    try:
                        title_el = card.find("h4")
                        if not title_el:
                            continue
                        title = title_el.get_text(strip=True)
                        href = card.get("href", "").split("?")[0]

                        start_meta = card.find("meta", {"itemprop": "startDate"})
                        end_meta = card.find("meta", {"itemprop": "endDate"})
                        deadline = parse_date(end_meta["content"]) if end_meta else None
                        starts = parse_date(start_meta["content"]) if start_meta else None

                        # Location: full anchor text after the date segment
                        segs = [s.strip() for s in card.get_text("|", strip=True).split("|") if s.strip()]
                        location = None
                        if len(segs) >= 3:
                            location = segs[2]
                        elif len(segs) == 2:
                            location = segs[1]

                        opp = self.create_opportunity(
                            title=title,
                            company="MLH",
                            opp_type="HACKATHON",
                            source_id=href.rsplit("/", 1)[-1] or title,
                            url=href,
                            location=location or "See event page",
                            location_type="Remote" if location and "online" in location.lower() else "On-site",
                            deadline=deadline or default_deadline(),
                            posted_date=starts,
                            short_description=f"MLH season {season} hackathon",
                        )
                        opportunities.append(opp)
                    except Exception:
                        continue

                logger.info(f"MLH: {len(cards)} events from season {season}")
        except Exception as e:
            logger.error(f"MLH fetch error: {e}")

        return opportunities


def _current_mlh_year() -> int:
    import datetime
    now = datetime.datetime.utcnow()
    return now.year if now.month >= 6 else now.year - 1
