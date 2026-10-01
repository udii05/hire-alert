from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "Hire-Alert AI Agent Backend"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/hire_alert"
    database_url_sync: str = "postgresql://postgres:postgres@localhost:5432/hire_alert"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Auth
    backend_api_key: str = "backend-api-key-change-in-production"

    # CORS: comma-separated list of allowed frontend origins
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    # Agent settings
    agent_poll_interval: int = 60
    agent_batch_size: int = 10
    refresh_interval_hours: int = 24

    # Matching: only opportunities with fit score >= threshold are recommended
    match_threshold: float = 75.0

    # Priority buckets (days until deadline)
    high_priority_days: int = 7
    medium_priority_days: int = 15

    # When a source has no deadline, assume this many days before closure
    default_deadline_days: int = 30

    # Default search keywords used by discovery agents (combined with user profile)
    job_search_keywords: str = (
        "software engineer,frontend developer,backend developer,"
        "full stack developer,data scientist,machine learning engineer,"
        "data analyst,devops engineer,cloud engineer,product manager,"
        "intern,fresher,entry level,ai engineer,qa engineer"
    )

    # Kaggle API credentials (optional; scraping fallback used otherwise)
    kaggle_username: str = ""
    kaggle_key: str = ""

    # Rate limiting
    rate_limit_per_minute: int = 30

    # User agent for web scraping
    user_agent: str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )

    # Email settings
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    email_from: str = "noreply@hire-alert.com"
    email_enabled: bool = False

    # App URL for links in emails
    app_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
