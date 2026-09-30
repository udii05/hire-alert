"""
Background worker for executing AI agent tasks.
Processes agent jobs from Redis queue or direct invocation.
"""

import logging
from typing import Optional
from app.agents.orchestrator import OrchestratorAgent
from app.models.database import async_session

logger = logging.getLogger(__name__)


class AgentWorker:
    """Processes AI agent tasks in the background."""

    def __init__(self):
        self.orchestrator = OrchestratorAgent()

    async def process_user_refresh(self, user_id: str):
        """Execute full refresh workflow for a specific user."""
        logger.info(f"Processing refresh for user {user_id}")

        try:
            async with async_session() as db:
                result = await self.orchestrator.execute(
                    db,
                    user_id=user_id,
                    workflow_type="full_refresh",
                )

                logger.info(
                    f"Refresh completed for user {user_id}: "
                    f"{result.get('overall_status')}"
                )
                return result

        except Exception as e:
            logger.error(f"Refresh failed for user {user_id}: {e}")
            raise

    async def process_daily_refresh(self):
        """Execute daily refresh for all active users."""
        logger.info("Processing daily refresh for all users")

        try:
            async with async_session() as db:
                result = await self.orchestrator.execute(
                    db,
                    workflow_type="daily_refresh",
                )
                logger.info(
                    f"Daily refresh completed: {result.get('overall_status')}"
                )
                return result

        except Exception as e:
            logger.error(f"Daily refresh failed: {e}")
            raise
