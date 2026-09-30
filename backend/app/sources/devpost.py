"""Devpost — public hackathon API (hackathons & software competitions)."""

import logging
import re
from typing import List, Dict, Any
from app.sources.base import BaseSource, clean_text, parse_date

logger = logging.getLogger(__name__)

DEVPOST_API = "https://devpost.com/api/hackathons"
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def parse_devpost_deadline(value: str):
    """
    Devpost returns date strings like:
      "Aug 21 - Sep 15, 2026"
      "Dec 11 - 15, 2026"
      "Sep 15, 2026"
    Extract the END date (deadline) and convert to datetime.
    """
    if not value:
        return None
    parts = [p.strip() for p in str(value).split("-")]
    end = parts[-1]

    year_match = re.search(r"(\d{4})", value)
    if year_match:
        year = year_match.group(1)
        if "," not in end:
            end = f"{end}, {year}"

    # If end part lacks a month name, borrow it from the start part
    if not any(mon in end for mon in MONTHS) and len(parts) > 1:
        start = parts[0]
        for mon in MONTHS:
            if mon in start:
                end = f"{mon} {end}"
                break

    return parse_date(end)


class DevpostSource(BaseSource):
    """Devpost public API: upcoming and open hackathons."""

    def __init__(self):
        super().__init__("Devpost")

    async def fetch_hackathons(self) -> List[Dict[str, Any]]:
        opportunities = []
        try:
            for status in ["upcoming", "open"]:
                response = await self.client.get(
                    DEVPOST_API,
                    params={"status": status, "per_page": 50},
                )
                if response.status_code != 200:
                    logger.warning(f"Devpost status {response.status_code}")
                    continue

                data = response.json()
                for item in data.get("hackathons", []):
                    loc = item.get("displayed_location") or {}
                    if isinstance(loc, dict):
                        location = loc.get("location")
                    else:
                        location = str(loc)

                    opp = self.create_opportunity(
                        title=item.get("title", "Devpost Hackathon"),
                        company=item.get("organization_name", "Devpost"),
                        opp_type="HACKATHON",
                        source_id=str(item.get("id", item.get("url", item.get("title")))),
                        short_description=clean_text(item.get("tagline")),
                        url=item.get("url"),
                        location=location or "Online",
                        location_type="Remote",
                        skills=[t.get("name") for t in item.get("themes", []) if t.get("name")],
                        deadline=parse_devpost_deadline(item.get("submission_period_dates")),
                        posted_date=parse_date(item.get("submission_period_dates", "").split("-")[0]) if item.get("submission_period_dates") else None,
                    )
                    opportunities.append(opp)

                logger.info(f"Devpost ({status}): {len(data.get('hackathons', []))} hackathons")
        except Exception as e:
            logger.error(f"Devpost fetch error: {e}")

        return opportunities
