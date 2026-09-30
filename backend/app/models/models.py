"""
SQLAlchemy models mirroring the Prisma schema (camelCase columns, exact table names).

The frontend (Next.js + Prisma) owns the database schema. The backend agents
read/write the SAME PostgreSQL tables, so every column/table name must match
exactly what Prisma generated.
"""

import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text,
    Enum, JSON, ForeignKey, UniqueConstraint, Index
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.models.database import Base
import enum


class OpportunityType(str, enum.Enum):
    JOB = "JOB"
    INTERNSHIP = "INTERNSHIP"
    HACKATHON = "HACKATHON"
    SCHOLARSHIP = "SCHOLARSHIP"
    COMPETITION = "COMPETITION"
    EVENT = "EVENT"
    OPEN_SOURCE = "OPEN_SOURCE"
    FREELANCING = "FREELANCING"


class ApplicationStatus(str, enum.Enum):
    SAVED = "SAVED"
    APPLIED = "APPLIED"
    INTERVIEW = "INTERVIEW"
    ASSESSMENT = "ASSESSMENT"
    OFFER = "OFFER"
    REJECTED = "REJECTED"
    NOT_INTERESTED = "NOT_INTERESTED"
    ARCHIVED = "ARCHIVED"


class ExperienceLevel(str, enum.Enum):
    FRESHER = "FRESHER"
    JUNIOR = "JUNIOR"
    MID = "MID"
    SENIOR = "SENIOR"
    ANY = "ANY"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, nullable=True)
    emailVerified = Column(DateTime, nullable=True)
    image = Column(String, nullable=True)
    password = Column(String, nullable=True)
    authProvider = Column(Enum("GOOGLE", "GITHUB", "CREDENTIALS", name="AuthProvider", native_enum=True), nullable=True, default="CREDENTIALS")
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True)
    userId = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    college = Column(String, nullable=True)
    degree = Column(String, nullable=True)
    branch = Column(String, nullable=True)
    graduationYear = Column(Integer, nullable=True)
    cgpa = Column(Float, nullable=True)
    skills = Column(ARRAY(Text), default=list)
    preferredRoles = Column(ARRAY(Text), default=list)
    preferredLocations = Column(ARRAY(Text), default=list)
    preferredCompanies = Column(ARRAY(Text), default=list)
    interests = Column(ARRAY(Text), default=list)

    # Basic Information
    phone = Column(String, nullable=True)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    timeZone = Column(String, nullable=True)
    nationality = Column(String, nullable=True)
    workAuthorization = Column(String, nullable=True)
    visaSponsorshipRequired = Column(Boolean, nullable=True)

    # Job Preferences
    jobType = Column(String, nullable=True)
    workMode = Column(String, nullable=True)
    minSalary = Column(Float, nullable=True)
    targetSalary = Column(Float, nullable=True)
    noticePeriod = Column(String, nullable=True)
    earliestJoining = Column(String, nullable=True)
    willingToRelocate = Column(Boolean, nullable=True)

    # Education extras
    specialization = Column(String, nullable=True)
    university = Column(String, nullable=True)
    relevantCoursework = Column(ARRAY(Text), default=list)

    # Experience
    currentStatus = Column(String, nullable=True)
    yearsOfExperience = Column(Float, nullable=True)
    currentCompany = Column(String, nullable=True)
    previousCompanies = Column(ARRAY(Text), default=list)
    hasInternships = Column(Boolean, nullable=True)
    hasFreelancing = Column(Boolean, nullable=True)
    hasResearch = Column(Boolean, nullable=True)
    hasTeaching = Column(Boolean, nullable=True)
    hasOpenSource = Column(Boolean, nullable=True)
    experienceEntries = Column(JSON, nullable=True)

    # Technical Skills (structured categories)
    programmingLanguages = Column(ARRAY(Text), default=list)
    frameworks = Column(ARRAY(Text), default=list)
    libraries = Column(ARRAY(Text), default=list)
    databases = Column(ARRAY(Text), default=list)
    cloudPlatforms = Column(ARRAY(Text), default=list)
    devopsTools = Column(ARRAY(Text), default=list)
    aiMlTechnologies = Column(ARRAY(Text), default=list)
    dataAnalysisTools = Column(ARRAY(Text), default=list)
    designTools = Column(ARRAY(Text), default=list)
    softSkills = Column(ARRAY(Text), default=list)
    skillProficiency = Column(JSON, nullable=True)

    # Resume & Portfolio
    resumeUrl = Column(String, nullable=True)
    portfolioUrl = Column(String, nullable=True)
    githubUrl = Column(String, nullable=True)
    linkedinUrl = Column(String, nullable=True)
    leetcodeUrl = Column(String, nullable=True)
    codechefUrl = Column(String, nullable=True)
    hackerrankUrl = Column(String, nullable=True)
    kaggleUrl = Column(String, nullable=True)
    personalWebsite = Column(String, nullable=True)

    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.userId,
            "college": self.college,
            "degree": self.degree,
            "branch": self.branch,
            "graduationYear": self.graduationYear,
            "cgpa": self.cgpa,
            "skills": self.skills or [],
            "preferredRoles": self.preferredRoles or [],
            "preferredLocations": self.preferredLocations or [],
            "preferredCompanies": self.preferredCompanies or [],
            "interests": self.interests or [],
            "phone": self.phone,
            "city": self.city,
            "country": self.country,
            "timeZone": self.timeZone,
            "nationality": self.nationality,
            "workAuthorization": self.workAuthorization,
            "visaSponsorshipRequired": self.visaSponsorshipRequired,
            "jobType": self.jobType,
            "workMode": self.workMode,
            "minSalary": self.minSalary,
            "targetSalary": self.targetSalary,
            "noticePeriod": self.noticePeriod,
            "earliestJoining": self.earliestJoining,
            "willingToRelocate": self.willingToRelocate,
            "specialization": self.specialization,
            "university": self.university,
            "relevantCoursework": self.relevantCoursework or [],
            "currentStatus": self.currentStatus,
            "yearsOfExperience": self.yearsOfExperience,
            "currentCompany": self.currentCompany,
            "previousCompanies": self.previousCompanies or [],
            "hasInternships": self.hasInternships,
            "hasFreelancing": self.hasFreelancing,
            "hasResearch": self.hasResearch,
            "hasTeaching": self.hasTeaching,
            "hasOpenSource": self.hasOpenSource,
            "experienceEntries": self.experienceEntries,
            "programmingLanguages": self.programmingLanguages or [],
            "frameworks": self.frameworks or [],
            "libraries": self.libraries or [],
            "databases": self.databases or [],
            "cloudPlatforms": self.cloudPlatforms or [],
            "devopsTools": self.devopsTools or [],
            "aiMlTechnologies": self.aiMlTechnologies or [],
            "dataAnalysisTools": self.dataAnalysisTools or [],
            "designTools": self.designTools or [],
            "softSkills": self.softSkills or [],
            "skillProficiency": self.skillProficiency,
            "resumeUrl": self.resumeUrl,
            "portfolioUrl": self.portfolioUrl,
            "githubUrl": self.githubUrl,
            "linkedinUrl": self.linkedinUrl,
            "leetcodeUrl": self.leetcodeUrl,
            "codechefUrl": self.codechefUrl,
            "hackerrankUrl": self.hackerrankUrl,
            "kaggleUrl": self.kaggleUrl,
            "personalWebsite": self.personalWebsite,
        }


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True)
    profileId = Column(String, ForeignKey("profiles.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    technologies = Column(ARRAY(Text), default=list)
    link = Column(String, nullable=True)
    startDate = Column(DateTime, nullable=True)
    endDate = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class Opportunity(Base):
    __tablename__ = "opportunities"
    __table_args__ = (
        UniqueConstraint("source", "sourceId", name="opportunities_source_sourceId_key"),
        Index("ix_opportunity_type_active", "type", "isActive"),
    )

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    shortDescription = Column(String, nullable=True)
    type = Column(Enum(OpportunityType, name="OpportunityType", native_enum=True), nullable=False)
    location = Column(String, nullable=True)
    locationType = Column(String, default="On-site")
    salary = Column(String, nullable=True)
    stipend = Column(String, nullable=True)
    currency = Column(String, default="INR")
    experienceLevel = Column(Enum(ExperienceLevel, name="ExperienceLevel", native_enum=True), default=ExperienceLevel.ANY)
    deadline = Column(DateTime, nullable=True)
    postedDate = Column(DateTime, nullable=True)
    url = Column(String, nullable=True)
    source = Column(String, nullable=False)
    sourceId = Column(String, nullable=True)
    skills = Column(ARRAY(Text), default=list)
    eligibility = Column(Text, nullable=True)
    responsibilities = Column(ARRAY(Text), default=list)
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "company": self.company,
            "description": self.description,
            "shortDescription": self.shortDescription,
            "type": enum_value(self.type),
            "location": self.location,
            "locationType": self.locationType,
            "salary": self.salary,
            "stipend": self.stipend,
            "currency": self.currency,
            "experienceLevel": enum_value(self.experienceLevel),
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "postedDate": self.postedDate.isoformat() if self.postedDate else None,
            "url": self.url,
            "source": self.source,
            "sourceId": self.sourceId,
            "skills": self.skills or [],
            "eligibility": self.eligibility,
            "responsibilities": self.responsibilities or [],
            "isActive": self.isActive,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None,
        }


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (
        UniqueConstraint("userId", "opportunityId", name="applications_userId_opportunityId_key"),
        Index("ix_application_status", "status"),
    )

    id = Column(String, primary_key=True)
    userId = Column(String, ForeignKey("users.id"), nullable=False)
    opportunityId = Column(String, ForeignKey("opportunities.id"), nullable=False)
    status = Column(Enum(ApplicationStatus, name="ApplicationStatus", native_enum=True), default=ApplicationStatus.SAVED)
    fitScore = Column(Float, nullable=True)
    fitExplanation = Column(Text, nullable=True)
    matchedSkills = Column(ARRAY(Text), default=list)
    missingSkills = Column(ARRAY(Text), default=list)
    notes = Column(Text, nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.userId,
            "opportunityId": self.opportunityId,
            "status": enum_value(self.status),
            "fitScore": self.fitScore,
            "fitExplanation": self.fitExplanation,
            "matchedSkills": self.matchedSkills or [],
            "missingSkills": self.missingSkills or [],
            "notes": self.notes,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None,
            "updatedAt": self.updatedAt.isoformat() if self.updatedAt else None,
        }


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True)
    userId = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=True)
    type = Column(String, default="INFO")
    read = Column(Boolean, default=False)
    link = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)


def enum_value(v):
    """Return the plain string value of an enum, regardless of whether the
    ORM returned a Python enum instance or the raw database string."""
    if v is None:
        return None
    return v.value if hasattr(v, "value") else str(v)


class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(String, primary_key=True)
    agentName = Column(String, nullable=False, index=True)
    action = Column(String, nullable=False)
    status = Column(String, default="RUNNING", index=True)
    input = Column(JSON, nullable=True)
    output = Column(JSON, nullable=True)
    error = Column(Text, nullable=True)
    startedAt = Column(DateTime, default=datetime.datetime.utcnow)
    completedAt = Column(DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "agentName": self.agentName,
            "action": self.action,
            "status": self.status,
            "error": self.error,
            "startedAt": self.startedAt.isoformat() if self.startedAt else None,
            "completedAt": self.completedAt.isoformat() if self.completedAt else None,
        }


