import logging
from typing import Dict, Any, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.agents.base import BaseAgent
from app.models.models import Opportunity, Application, enum_value
from app.core.config import settings

logger = logging.getLogger(__name__)


def priority_bucket(days_until_deadline: float) -> str:
    """
    HIGH: less than 7 days left
    MEDIUM: 7-15 days left
    LOW: more than 15 days left
    """
    if days_until_deadline is None:
        return "LOW"
    if days_until_deadline < settings.high_priority_days:
        return "HIGH"
    if days_until_deadline <= settings.medium_priority_days:
        return "MEDIUM"
    return "LOW"


class RecommendationAgent(BaseAgent):
    """
    Curates the user's personalized board:
    - only opportunities with fit score >= match_threshold (75%)
    - excludes applied/rejected
    - buckets into HIGH / MEDIUM / LOW priority by deadline
    """

    def __init__(self):
        super().__init__("RecommendationAgent")

    async def execute(self, db: AsyncSession, **kwargs) -> Dict[str, Any]:
        """Generate ranked recommendations for a user."""
        await self.start_log(db, "generate_recommendations", kwargs)

        user_id = kwargs.get("user_id")
        if not user_id:
            return {"status": "skipped", "reason": "No user_id provided"}

        threshold = settings.match_threshold

        # User's SAVED applications carry fit scores
        app_result = await db.execute(
            select(Application).where(
                and_(
                    Application.userId == user_id,
                    Application.status == "SAVED",
                )
            )
        )
        saved_apps = {a.opportunityId: a for a in app_result.scalars().all()}

        # Exclude everything the user rejected/applied to
        excluded_result = await db.execute(
            select(Application.opportunityId).where(
                and_(
                    Application.userId == user_id,
                    Application.status.in_(["REJECTED", "NOT_INTERESTED", "ARCHIVED", "APPLIED"]),
                )
            )
        )
        excluded_ids = {r[0] for r in excluded_result.fetchall()}

        query = select(Opportunity).where(Opportunity.isActive == True)
        result = await db.execute(query)
        opportunities = list(result.scalars().all())

        now = datetime.utcnow()
        recommendations = []
        counts = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}

        for opp in opportunities:
            if opp.id in excluded_ids:
                continue
            app = saved_apps.get(opp.id)
            fit_score = app.fitScore if app and app.fitScore is not None else 0

            # Gate: only share jobs with >= 75% match
            if fit_score < threshold:
                continue

            days_left = self._days_until_deadline(opp.deadline, now)
            bucket = priority_bucket(days_left)
            counts[bucket] += 1

            recommendations.append({
                "id": opp.id,
                "title": opp.title,
                "company": opp.company,
                "type": enum_value(opp.type),
                "location": opp.location,
                "fit_score": fit_score,
                "priority": bucket,
                "days_until_deadline": days_left,
                "deadline": opp.deadline.isoformat() if opp.deadline else None,
                "url": opp.url,
            })

        # Sort: HIGH first, then fit score desc
        order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
        recommendations.sort(key=lambda x: (order.get(x["priority"], 3), -x["fit_score"]))

        result_data = {
            "status": "completed",
            "match_threshold": threshold,
            "total_recommendations": len(recommendations),
            "priority_counts": counts,
            "top_10": recommendations[:10],
        }

        await self.complete_log(db, output_data=result_data)
        return result_data

    def _days_until_deadline(self, deadline, now: datetime) -> float | None:
        if not deadline:
            return None
        if deadline.tzinfo:
            deadline = deadline.replace(tzinfo=None)
        return (deadline - now).total_seconds() / 86400
