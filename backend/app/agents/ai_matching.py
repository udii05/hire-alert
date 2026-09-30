import logging
from typing import Dict, Any, List, Set, Tuple
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.agents.base import BaseAgent, get_user_profile
from app.models.models import Opportunity, Application, enum_value

logger = logging.getLogger(__name__)


class AIMatchingAgent(BaseAgent):
    """
    AI matching agent: scores each active opportunity against the user's
    profile (skills, roles, education, location, experience) and stores the
    fit score on the user's SAVED application row.
    """

    def __init__(self):
        super().__init__("AIMatchingAgent")

    async def execute(self, db: AsyncSession, **kwargs) -> Dict[str, Any]:
        """Match opportunities with user profile and compute fit scores."""
        await self.start_log(db, "match_opportunities", kwargs)

        user_id = kwargs.get("user_id")
        if not user_id:
            return {"status": "skipped", "reason": "No user_id provided"}

        # Load profile directly from the shared database
        profile = await get_user_profile(db, user_id)
        if not profile.get("email"):
            return {"status": "skipped", "reason": "User not found"}

        opportunities = await self._get_matching_candidates(db, user_id)

        matched_count = 0
        results = []

        for opp in opportunities:
            fit_score, matched_skills, missing_skills, explanation = self._compute_fit_score(
                profile, opp
            )

            await self._upsert_application_fit_score(
                db, user_id, opp.id, fit_score,
                matched_skills, missing_skills, explanation,
            )

            if fit_score > 0:
                matched_count += 1
                results.append({
                    "opportunity_id": opp.id,
                    "title": opp.title,
                    "fit_score": fit_score,
                    "matched_skills": matched_skills[:5],
                })

        await db.commit()

        result = {
            "status": "completed",
            "user_id": user_id,
            "opportunities_processed": len(opportunities),
            "opportunities_scored": matched_count,
        }

        await self.complete_log(db, output_data=result)
        return result

    async def _get_matching_candidates(self, db: AsyncSession, user_id: str) -> List[Opportunity]:
        """Active opportunities the user hasn't applied to or rejected."""
        acted_result = await db.execute(
            select(Application.opportunityId).where(
                and_(
                    Application.userId == user_id,
                    Application.status.in_(["APPLIED", "REJECTED"]),
                )
            )
        )
        acted_ids = [r[0] for r in acted_result.fetchall()]

        query = select(Opportunity).where(Opportunity.isActive == True)
        if acted_ids:
            query = query.where(Opportunity.id.notin_(acted_ids))
        query = query.limit(2000)  # score the whole board

        result = await db.execute(query)
        return list(result.scalars().all())

    async def _upsert_application_fit_score(
        self,
        db: AsyncSession,
        user_id: str,
        opportunity_id: str,
        fit_score: float,
        matched_skills: List[str],
        missing_skills: List[str],
        explanation: str,
    ):
        result = await db.execute(
            select(Application).where(
                and_(
                    Application.userId == user_id,
                    Application.opportunityId == opportunity_id,
                )
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            existing.fitScore = fit_score
            existing.matchedSkills = matched_skills
            existing.missingSkills = missing_skills
            existing.fitExplanation = explanation
        else:
            import uuid
            db.add(Application(
                id=str(uuid.uuid4()),
                userId=user_id,
                opportunityId=opportunity_id,
                status="SAVED",
                fitScore=fit_score,
                matchedSkills=matched_skills,
                missingSkills=missing_skills,
                fitExplanation=explanation,
            ))

    def _compute_fit_score(
        self, profile: Dict[str, Any], opportunity: Opportunity
    ) -> Tuple[int, List[str], List[str], str]:
        """Compute a comprehensive 0-100 fit score."""
        # Aggregate every skill category from the rich profile
        all_user_skills: List[str] = []
        for key in [
            "skills", "programmingLanguages", "frameworks", "libraries",
            "databases", "cloudPlatforms", "devopsTools", "aiMlTechnologies",
            "dataAnalysisTools", "designTools", "softSkills",
        ]:
            all_user_skills.extend(profile.get(key) or [])
        user_skills = set(s.strip().lower() for s in all_user_skills if s)
        opp_skills = set(s.strip().lower() for s in (opportunity.skills or []) if s)

        user_roles = set(r.strip().lower() for r in (profile.get("preferredRoles") or []) if r)
        user_locations = set(l.strip().lower() for l in (profile.get("preferredLocations") or []) if l)

        title_lower = (opportunity.title or "").lower()
        company_lower = (opportunity.company or "").lower()

        # --- Skills (40%) ---
        matched_skills = list(opp_skills & user_skills)
        missing_skills = list(opp_skills - user_skills)

        # Detect user skills mentioned in title/description (sources often
        # omit structured skill tags, so scan the posting text as fallback)
        text_blob = f"{title_lower} {company_lower} {(opportunity.description or '').lower()}"
        text_matched = [s for s in user_skills if len(s) > 2 and s in text_blob]
        for skill in text_matched:
            if skill not in matched_skills:
                matched_skills.append(skill)

        skill_score = 0
        if opp_skills:
            skill_score = (len(opp_skills & user_skills) / len(opp_skills)) * 40
        elif text_matched:
            skill_score = 40  # skills clearly present in the posting
        else:
            skill_score = 20  # no structured skills; neutral

        # --- Role alignment (25%) ---
        role_score = 0
        if user_roles:
            for role in user_roles:
                if role in title_lower or role in company_lower:
                    role_score = 25
                    break
            # Partial: any role token appears in title
            if role_score == 0:
                role_tokens = [t for r in user_roles for t in r.split() if len(t) > 3]
                if any(tok in title_lower for tok in role_tokens):
                    role_score = 15

        # --- Education (15%) ---
        education_score = 0
        degree = (profile.get("degree") or "").lower()
        branch = (profile.get("branch") or "").lower()
        elig_lower = (opportunity.eligibility or "").lower() if opportunity.eligibility else ""

        if degree:
            if "b.tech" in degree or "b.e" in degree or "m.tech" in degree:
                education_score += 5
        if branch:
            domain_keywords = {
                "computer": ["software", "developer", "programming", "full stack", "frontend", "backend", "data"],
                "electronics": ["electronics", "vlsi", "embedded", "iot", "hardware"],
                "mechanical": ["mechanical", "cad", "manufacturing", "thermo"],
                "civil": ["civil", "structural", "construction"],
            }
            for key, words in domain_keywords.items():
                if key in branch and any(w in title_lower for w in words):
                    education_score += 10
                    break
        if elig_lower and degree and any(d in elig_lower for d in ["b.tech", "b.e", "m.tech", "b.sc", "m.sc", "bca", "mca"]):
            education_score += 5

        # --- Location (10%) ---
        location_score = 0
        opp_location = (opportunity.location or "").lower()
        if opp_location:
            if "remote" in opp_location:
                location_score = 10
            elif user_locations:
                for loc in user_locations:
                    if loc in opp_location or ("remote" in loc):
                        location_score = 10
                        break

        # --- Experience (10%) ---
        experience_score = 5  # neutral baseline
        exp = enum_value(opportunity.experienceLevel) or "ANY"
        is_student = bool(profile.get("graduationYear")) and profile.get("graduationYear") >= datetime.utcnow().year
        if exp in ("ANY", "FRESHER"):
            experience_score = 10
        elif exp == "JUNIOR":
            experience_score = 8
        elif exp == "SENIOR" and is_student:
            experience_score = 0

        # --- Domain interest bonus (up to 5) ---
        # User's "interests" (Jobs/Internships/Hackathons/etc.) vs posting type
        domain_score = 0
        opp_type = enum_value(opportunity.type)
        interests = {i.lower() for i in (profile.get("interests") or [])}
        type_label = (opp_type or "").lower()
        if interests:
            type_map = {
                "jobs": "job", "internships": "internship",
                "hackathons": "hackathon", "scholarships": "scholarship",
                "events": "event", "freelancing": "freelancing",
                "competitions": "competition", "open source": "open_source",
            }
            if type_label in interests or type_map.get(type_label, "") in interests:
                domain_score = 5

        total = min(100, int(skill_score + role_score + education_score + location_score + experience_score + domain_score))

        explanation_parts = []
        if matched_skills:
            explanation_parts.append(f"Matched skills: {', '.join(matched_skills[:5])}")
        if missing_skills:
            explanation_parts.append(f"Consider learning: {', '.join(missing_skills[:3])}")
        if role_score >= 20:
            explanation_parts.append("Role aligns with your preferences")
        if location_score > 0:
            explanation_parts.append("Location matches")

        explanation = ". ".join(explanation_parts) if explanation_parts else "Partial match"

        return total, matched_skills, missing_skills, explanation
