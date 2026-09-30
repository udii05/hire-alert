import logging
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.base import BaseAgent
from app.sources.unstop import UnstopSource

logger = logging.getLogger(__name__)


class ScholarshipAgent(BaseAgent):
    """Discovers scholarship opportunities."""

    def __init__(self):
        super().__init__("ScholarshipAgent")

    async def execute(self, db: AsyncSession, **kwargs) -> Dict[str, Any]:
        """Fetch and return scholarship opportunities."""
        await self.start_log(db, "discover_scholarships", kwargs)

        all_scholarships = []
        errors = []

        sources = [
            ("unstop", UnstopSource()),
        ]

        for name, source in sources:
            try:
                scholarships = await source.fetch_scholarships()
                all_scholarships.extend(scholarships)
                logger.info(f"Found {len(scholarships)} scholarships from {name}")
            except Exception as e:
                errors.append({"source": name, "error": str(e)})
                logger.error(f"Error from {name}: {e}")

        result = {
            "opportunities": all_scholarships,
            "total_count": len(all_scholarships),
            "errors": errors,
        }

        await self.complete_log(db, output_data=result)
        return result
