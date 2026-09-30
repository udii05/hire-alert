import logging
import uuid
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.agents.base import BaseAgent
from app.models.models import Opportunity

logger = logging.getLogger(__name__)

# Fields the discovery sources produce (camelCase, Prisma-compatible)
UPSERT_FIELDS = [
    "title", "company", "description", "shortDescription", "type",
    "location", "locationType", "salary", "stipend", "currency",
    "experienceLevel", "deadline", "postedDate", "url", "source",
    "sourceId", "skills", "eligibility", "responsibilities", "isActive",
]


class DatabaseUpdateAgent(BaseAgent):
    """Upserts discovered opportunities and deactivates expired ones."""

    def __init__(self):
        super().__init__("DatabaseUpdateAgent")

    async def execute(self, db: AsyncSession, **kwargs) -> Dict[str, Any]:
        """Insert new opportunities, update existing, deactivate expired."""
        await self.start_log(db, "update_database", kwargs)

        stats = {
            "inserted": 0,
            "updated": 0,
            "deactivated": 0,
            "errors": [],
        }

        new_opportunities: List[Dict] = kwargs.get("opportunities", [])
        seen = set()

        for opp_data in new_opportunities:
            source = opp_data.get("source", "unknown")
            source_id = opp_data.get("sourceId")

            # Skip incomplete payloads and duplicate source rows in the same batch
            if not opp_data.get("title") or not opp_data.get("company"):
                continue
            dedup_key = (source, source_id or opp_data.get("title"))
            if dedup_key in seen:
                continue
            seen.add(dedup_key)

            try:
                # Check if already exists by (source, sourceId)
                existing = None
                if source_id:
                    result = await db.execute(
                        select(Opportunity).where(
                            and_(
                                Opportunity.source == source,
                                Opportunity.sourceId == source_id,
                            )
                        )
                    )
                    existing = result.scalar_one_or_none()

                # Fallback: match by normalized title+company if no sourceId
                if not existing:
                    result = await db.execute(
                        select(Opportunity).where(
                            and_(
                                Opportunity.source == source,
                                Opportunity.title == opp_data["title"],
                                Opportunity.company == opp_data["company"],
                            )
                        )
                    )
                    existing = result.scalar_one_or_none()

                if existing:
                    # Refresh live fields so re-scraped postings stay current
                    for key in UPSERT_FIELDS:
                        value = opp_data.get(key)
                        if value is not None and hasattr(existing, key):
                            setattr(existing, key, value)
                    existing.isActive = True
                    stats["updated"] += 1
                else:
                    clean = {
                        k: v for k, v in opp_data.items()
                        if k in UPSERT_FIELDS and v is not None
                    }
                    opp = Opportunity(id=str(uuid.uuid4()), **clean)
                    db.add(opp)
                    stats["inserted"] += 1
            except Exception as e:
                stats["errors"].append({"source": source, "error": str(e)})
                logger.error(f"DB upsert error: {e}")

        # Deactivate opportunities whose deadline has passed
        import datetime
        now = datetime.datetime.utcnow()
        expired = await db.execute(
            select(Opportunity).where(
                and_(
                    Opportunity.deadline < now,
                    Opportunity.isActive == True,
                )
            )
        )
        for opp in expired.scalars().all():
            opp.isActive = False
            stats["deactivated"] += 1

        await db.commit()

        result = {
            "status": "completed",
            "batch_size": len(new_opportunities),
            **stats,
        }

        await self.complete_log(db, output_data=result)
        return result
