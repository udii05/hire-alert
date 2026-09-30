import logging
from typing import Dict, Any, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.agents.base import BaseAgent, get_user_profile
from app.models.models import Opportunity, Application, ApplicationStatus, enum_value

logger = logging.getLogger(__name__)


class EligibilityAgent(BaseAgent):
    """
    Filters opportunities based on user eligibility: experience level,
    graduation status, and education fields. Opportunities the user does
    not qualify for are marked NOT_INTERESTED on their application row so
    they never surface in the dashboard.
    """

    def __init__(self):
        super().__init__("EligibilityAgent")

    async def execute(self, db: AsyncSession, **kwargs) -> Dict[str, Any]:
        """Check and filter opportunities for eligibility."""
        await self.start_log(db, "check_eligibility", kwargs)

        user_id = kwargs.get("user_id")
        if not user_id:
            return {"status": "skipped", "reason": "No user_id provided"}

        profile = await get_user_profile(db, user_id)
        if not profile.get("email"):
            return {"status": "skipped", "reason": "User not found"}

        is_student = self._is_student(profile)

        # All active opportunities the user hasn't acted on yet
        acted_result = await db.execute(
            select(Application.opportunityId).where(Application.userId == user_id)
        )
        acted_ids = {r[0] for r in acted_result.fetchall()}

        query = select(Opportunity).where(Opportunity.isActive == True)
        result = await db.execute(query)
        opportunities = list(result.scalars().all())

        checked = 0
        ineligible = 0
        eligible = 0

        for opp in opportunities:
            if opp.id in acted_ids:
                continue
            checked += 1

            reason = self._check_eligibility(opp, profile, is_student)
            if reason:
                ineligible += 1
                existing = await db.execute(
                    select(Application).where(
                        and_(
                            Application.userId == user_id,
                            Application.opportunityId == opp.id,
                        )
                    )
                )
                app = existing.scalar_one_or_none()
                if app:
                    app.status = ApplicationStatus.NOT_INTERESTED
                    app.notes = f"Not eligible: {reason}"
                else:
                    import uuid
                    db.add(Application(
                        id=str(uuid.uuid4()),
                        userId=user_id,
                        opportunityId=opp.id,
                        status=ApplicationStatus.NOT_INTERESTED,
                        notes=f"Not eligible: {reason}",
                    ))
            else:
                eligible += 1

        await db.commit()

        result = {
            "status": "completed",
            "total_checked": checked,
            "eligible": eligible,
            "ineligible": ineligible,
        }

        await self.complete_log(db, output_data=result)
        return result

    def _is_student(self, profile: Dict[str, Any]) -> bool:
        year = profile.get("graduationYear")
        if year:
            return year >= datetime.utcnow().year
        degree = (profile.get("degree") or "").lower()
        return any(
            token in degree
            for token in ["b.tech", "b.sc", "bca", "m.tech", "m.sc", "mca", "diploma", "polytechnic", "b.e", "m.e"]
        )

    def _check_eligibility(self, opp: Opportunity, profile: Dict[str, Any], is_student: bool) -> str | None:
        """Return a reason string if the user is NOT eligible, else None."""
        title = opp.title.lower()
        exp = enum_value(opp.experienceLevel) or "ANY"

        # Senior roles are out of scope for students/freshers
        if exp in ("SENIOR", "MID") and is_student:
            if any(kw in title for kw in ["senior", "lead", "manager", "head", "principal", "staff"]):
                return f"Requires {exp} experience"

        # Internships only make sense for students/recent grads
        if enum_value(opp.type) == "INTERNSHIP" and not is_student:
            year = profile.get("graduationYear")
            if year and year < datetime.utcnow().year - 2:
                return "Internship targeted at students"

        # Check title vs degree branch (best effort)
        if enum_value(opp.type) in ("JOB", "INTERNSHIP"):
            branch = (profile.get("branch") or "").lower()
            if branch and "computer" in branch and any(
                kw in title for kw in ["mechanical", "civil engineer", "chemical"]
            ):
                return "Domain does not match branch"

        return None
