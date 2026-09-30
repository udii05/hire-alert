"""
Background scheduler for periodic opportunity refresh and maintenance tasks.
Uses APScheduler for scheduling.
"""

import logging
from typing import Optional
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger(__name__)

try:
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    from apscheduler.triggers.interval import IntervalTrigger

    SCHEDULER_AVAILABLE = True
except ImportError:
    AsyncIOScheduler = None
    IntervalTrigger = None
    SCHEDULER_AVAILABLE = False
    logger.warning("APScheduler not available. Background scheduling disabled.")


class RefreshScheduler:
    """Manages periodic refresh of opportunities."""

    def __init__(self):
        self.scheduler: Optional[AsyncIOScheduler] = None
        self._is_running = False

    async def start(self):
        """Start the scheduler."""
        if not SCHEDULER_AVAILABLE:
            logger.warning("Scheduler not available, skipping start")
            return

        self.scheduler = AsyncIOScheduler()
        self._is_running = True

        # Schedule daily refresh
        self.scheduler.add_job(
            self._daily_refresh,
            IntervalTrigger(hours=settings.refresh_interval_hours),
            id="daily_refresh",
            name="Daily opportunity refresh",
            replace_existing=True,
        )

        # Schedule cleanup every 6 hours
        self.scheduler.add_job(
            self._cleanup_expired,
            IntervalTrigger(hours=6),
            id="cleanup_expired",
            name="Cleanup expired opportunities",
            replace_existing=True,
        )

        # Check for high-priority (deadline < 7 days) jobs every 2 hours
        # so users get email/in-app alerts as soon as a job enters HIGH priority
        self.scheduler.add_job(
            self._check_high_priority,
            IntervalTrigger(hours=2),
            id="high_priority_alerts",
            name="High priority deadline alerts",
            replace_existing=True,
        )

        self.scheduler.start()
        logger.info("Background scheduler started")

    async def stop(self):
        """Stop the scheduler."""
        if self.scheduler and self._is_running:
            self.scheduler.shutdown(wait=False)
            self._is_running = False
            logger.info("Background scheduler stopped")

    async def _daily_refresh(self):
        """Execute daily refresh of all opportunities."""
        logger.info("Starting daily refresh cycle")
        try:
            from app.agents.orchestrator import OrchestratorAgent
            from app.models.database import async_session

            orchestrator = OrchestratorAgent()

            async with async_session() as db:
                result = await orchestrator.execute(
                    db, workflow_type="daily_refresh"
                )
                logger.info(
                    f"Daily refresh completed: {result.get('overall_status')}"
                )
        except Exception as e:
            logger.error(f"Daily refresh failed: {e}")

    async def _cleanup_expired(self):
        """Clean up expired opportunities."""
        logger.info("Starting expired opportunity cleanup")
        try:
            from app.models.database import async_session
            from app.models.models import Opportunity
            from sqlalchemy import select, and_
            import datetime

            now = datetime.datetime.utcnow()
            async with async_session() as db:
                result = await db.execute(
                    select(Opportunity).where(
                        and_(
                            Opportunity.deadline < now,
                            Opportunity.isActive == True,
                        )
                    )
                )
                count = 0
                for opp in result.scalars().all():
                    opp.isActive = False
                    count += 1
                await db.commit()
                logger.info(f"Cleanup completed: {count} opportunities deactivated")
        except Exception as e:
            logger.error(f"Cleanup failed: {e}")

    async def _check_high_priority(self):
        """
        Re-evaluate deadlines for all users and fire notifications for any
        job that has entered the HIGH priority zone (< 7 days to deadline).
        """
        logger.info("Checking high-priority deadlines for all users")
        try:
            from app.models.database import async_session
            from app.models.models import User
            from app.agents.notification import NotificationAgent
            from sqlalchemy import select

            async with async_session() as db:
                users = await db.execute(select(User))
                for user in users.scalars().all():
                    try:
                        await NotificationAgent().execute(db, user_id=user.id)
                    except Exception as e:
                        logger.error(f"High-priority check failed for {user.id}: {e}")
        except Exception as e:
            logger.error(f"High-priority check failed: {e}")


scheduler = RefreshScheduler()
