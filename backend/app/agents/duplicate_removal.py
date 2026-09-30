import logging
import uuid
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.agents.base import BaseAgent
from app.models.models import Opportunity, enum_value

logger = logging.getLogger(__name__)


class DuplicateRemovalAgent(BaseAgent):
    """Deactivates duplicate opportunities (same title + company + type)."""

    def __init__(self):
        super().__init__("DuplicateRemovalAgent")

    async def execute(self, db: AsyncSession, **kwargs) -> Dict[str, Any]:
        """Find duplicates and deactivate all but the newest copy."""
        await self.start_log(db, "remove_duplicates")

        try:
            result = await db.execute(
                select(Opportunity)
                .where(Opportunity.isActive == True)
                .order_by(Opportunity.createdAt)
            )
            rows = list(result.scalars().all())

            groups: Dict[str, List[Opportunity]] = {}
            for opp in rows:
                key = (
                    f"{opp.title.strip().lower()}|"
                    f"{opp.company.strip().lower()}|"
                    f"{enum_value(opp.type)}"
                )
                groups.setdefault(key, []).append(opp)

            deactivated = 0
            for key, group in groups.items():
                if len(group) > 1:
                    # Keep the earliest, deactivate the rest
                    for dup in group[1:]:
                        dup.isActive = False
                        deactivated += 1

            await db.commit()

            result_data = {
                "status": "completed",
                "duplicates_found": deactivated,
                "total_entries": len(rows),
                "unique_entries": len(groups),
            }

            await self.complete_log(db, output_data=result_data)
            return result_data

        except Exception as e:
            await self.complete_log(db, error=str(e))
            raise
