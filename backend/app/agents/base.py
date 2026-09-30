import uuid
import datetime
import logging
from typing import Optional, Any, Dict, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import AgentLog, User, Profile

logger = logging.getLogger(__name__)


def json_safe(value: Any) -> Any:
    """Recursively convert non-JSON-serializable values (datetime, date, set)."""
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, (datetime.datetime, datetime.date)):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [json_safe(v) for v in value]
    if hasattr(value, "value"):  # enum
        return value.value
    return str(value)


async def get_user_profile(db: AsyncSession, user_id: str) -> Dict[str, Any]:
    """Load a user's profile directly from the shared database.

    Returns a dict with skills, preferredRoles, preferredLocations, etc.
    Falls back to the User row (email/name) if no Profile row exists.
    """
    result = await db.execute(
        select(User, Profile).outerjoin(Profile, User.id == Profile.userId).where(User.id == user_id)
    )
    row = result.first()
    if not row:
        return {}

    user, profile = row
    if not profile:
        return {
            "userId": user_id,
            "email": user.email,
            "name": user.name,
            "skills": [],
            "preferredRoles": [],
            "preferredLocations": [],
            "preferredCompanies": [],
            "interests": [],
            "college": None,
            "degree": None,
            "branch": None,
            "graduationYear": None,
            "cgpa": None,
            "yearsOfExperience": None,
            "currentStatus": None,
            "currentCompany": None,
        }

    return {
        "userId": user_id,
        "email": user.email,
        "name": user.name,
        "skills": profile.skills or [],
        "preferredRoles": profile.preferredRoles or [],
        "preferredLocations": profile.preferredLocations or [],
        "preferredCompanies": profile.preferredCompanies or [],
        "interests": profile.interests or [],
        "college": profile.college,
        "degree": profile.degree,
        "branch": profile.branch,
        "graduationYear": profile.graduationYear,
        "cgpa": profile.cgpa,
        "phone": profile.phone,
        "city": profile.city,
        "country": profile.country,
        "timeZone": profile.timeZone,
        "nationality": profile.nationality,
        "workAuthorization": profile.workAuthorization,
        "visaSponsorshipRequired": profile.visaSponsorshipRequired,
        "jobType": profile.jobType,
        "workMode": profile.workMode,
        "minSalary": profile.minSalary,
        "targetSalary": profile.targetSalary,
        "noticePeriod": profile.noticePeriod,
        "earliestJoining": profile.earliestJoining,
        "willingToRelocate": profile.willingToRelocate,
        "specialization": profile.specialization,
        "university": profile.university,
        "relevantCoursework": profile.relevantCoursework or [],
        "currentStatus": profile.currentStatus,
        "yearsOfExperience": profile.yearsOfExperience,
        "currentCompany": profile.currentCompany,
        "previousCompanies": profile.previousCompanies or [],
        "hasInternships": profile.hasInternships,
        "hasFreelancing": profile.hasFreelancing,
        "hasResearch": profile.hasResearch,
        "hasTeaching": profile.hasTeaching,
        "hasOpenSource": profile.hasOpenSource,
        "experienceEntries": profile.experienceEntries,
        "programmingLanguages": profile.programmingLanguages or [],
        "frameworks": profile.frameworks or [],
        "libraries": profile.libraries or [],
        "databases": profile.databases or [],
        "cloudPlatforms": profile.cloudPlatforms or [],
        "devopsTools": profile.devopsTools or [],
        "aiMlTechnologies": profile.aiMlTechnologies or [],
        "dataAnalysisTools": profile.dataAnalysisTools or [],
        "designTools": profile.designTools or [],
        "softSkills": profile.softSkills or [],
        "skillProficiency": profile.skillProficiency,
        "resumeUrl": profile.resumeUrl,
        "portfolioUrl": profile.portfolioUrl,
        "githubUrl": profile.githubUrl,
        "linkedinUrl": profile.linkedinUrl,
        "leetcodeUrl": profile.leetcodeUrl,
        "codechefUrl": profile.codechefUrl,
        "hackerrankUrl": profile.hackerrankUrl,
        "kaggleUrl": profile.kaggleUrl,
        "personalWebsite": profile.personalWebsite,
    }


def search_keywords_from_profile(profile: Dict[str, Any]) -> list:
    """Build source-search keywords from the user's profile."""
    from app.core.config import settings

    defaults = [k.strip() for k in settings.job_search_keywords.split(",") if k.strip()]
    roles = [r for r in (profile.get("preferredRoles") or []) if r]
    skills = [s for s in (profile.get("skills") or []) if s]

    # Prefer profile-derived keywords; keep defaults as fallback/coverage
    keywords = roles[:6] or defaults[:6]
    if skills and len(keywords) < 6:
        keywords += skills[: (6 - len(keywords))]
    return keywords or defaults


class BaseAgent:
    """Base class for all AI agents with logging and lifecycle management."""

    def __init__(self, name: str):
        self.name = name
        self.log_id: Optional[str] = None

    async def start_log(
        self, db: AsyncSession, action: str, input_data: Optional[dict] = None
    ) -> str:
        """Create a log entry for agent execution."""
        log_id = str(uuid.uuid4())
        log = AgentLog(
            id=log_id,
            agentName=self.name,
            action=action,
            status="RUNNING",
            input=json_safe(input_data),
            startedAt=datetime.datetime.utcnow(),
        )
        db.add(log)
        await db.commit()
        self.log_id = log_id
        logger.info(f"Agent {self.name} started: {action}")
        return log_id

    async def complete_log(
        self, db: AsyncSession, output_data: Optional[Any] = None, error: Optional[str] = None
    ):
        """Mark agent execution as complete (success or failure)."""
        if not self.log_id:
            return

        result = await db.execute(select(AgentLog).where(AgentLog.id == self.log_id))
        log = result.scalar_one_or_none()
        if log:
            log.status = "FAILED" if error else "COMPLETED"
            log.completedAt = datetime.datetime.utcnow()
            if output_data:
                log.output = json_safe(output_data)
            if error:
                log.error = error
            await db.commit()
            logger.info(
                f"Agent {self.name} completed: status={log.status}"
            )

    async def execute(self, db: AsyncSession, **kwargs) -> Any:
        """Execute the agent's primary task. Override in subclasses."""
        raise NotImplementedError("Subclasses must implement execute()")

    def validate_input(self, **kwargs) -> bool:
        """Validate agent input. Override in subclasses if needed."""
        return True
