import logging
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.base import BaseAgent
from app.agents.job_discovery import JobDiscoveryAgent
from app.agents.internship import InternshipAgent
from app.agents.hackathon_event import HackathonEventAgent
from app.agents.scholarship import ScholarshipAgent
from app.agents.freelancing import FreelancingAgent
from app.agents.database_update import DatabaseUpdateAgent
from app.agents.eligibility import EligibilityAgent
from app.agents.duplicate_removal import DuplicateRemovalAgent
from app.agents.ai_matching import AIMatchingAgent
from app.agents.recommendation import RecommendationAgent
from app.agents.notification import NotificationAgent

logger = logging.getLogger(__name__)


class OrchestratorAgent(BaseAgent):
    """
    Orchestrates the multi-agent workflow:

      Phase 1  Discovery      — scrape/query all sources per category
      Phase 2  Persistence    — upsert everything into the shared database
      Phase 3  Eligibility    — mark out-of-scope jobs NOT_INTERESTED
      Phase 4  Deduplication  — deactivate duplicate postings
      Phase 5  AI Matching    — fit score (0-100) for every opportunity
      Phase 6  Curation       — keep only >= 75% match, bucket by deadline
      Phase 7  Notifications  — in-app + email for HIGH priority jobs
    """

    def __init__(self):
        super().__init__("Orchestrator")
        self.agents = {
            "job_discovery": JobDiscoveryAgent(),
            "internship": InternshipAgent(),
            "hackathon_event": HackathonEventAgent(),
            "scholarship": ScholarshipAgent(),
            "freelancing": FreelancingAgent(),
            "database_update": DatabaseUpdateAgent(),
            "eligibility": EligibilityAgent(),
            "duplicate_removal": DuplicateRemovalAgent(),
            "ai_matching": AIMatchingAgent(),
            "recommendation": RecommendationAgent(),
            "notification": NotificationAgent(),
        }

    async def execute(self, db: AsyncSession, **kwargs) -> Dict[str, Any]:
        """Execute the full agent workflow pipeline."""
        user_id = kwargs.get("user_id")
        workflow_type = kwargs.get("workflow_type", "full_refresh")

        await self.start_log(
            db,
            f"orchestrate_{workflow_type}",
            {"user_id": user_id, "workflow_type": workflow_type},
        )

        try:
            results: Dict[str, Any] = {}
            collected: List[Dict[str, Any]] = []

            # ---- Phase 1: Discovery ----
            logger.info("Phase 1: Discovery")
            discovery_agents = [
                "job_discovery",
                "internship",
                "hackathon_event",
                "scholarship",
                "freelancing",
            ]

            for agent_name in discovery_agents:
                try:
                    agent = self.agents[agent_name]
                    result = await agent.execute(db, user_id=user_id)
                    opps = result.get("opportunities", [])
                    collected.extend(opps)
                    results[agent_name] = {
                        "status": "completed",
                        "count": len(opps),
                    }
                    logger.info(f"{agent_name}: found {len(opps)} opportunities")
                except Exception as e:
                    results[agent_name] = {"status": "failed", "error": str(e)}
                    logger.error(f"{agent_name} failed: {e}")

            # ---- Phase 2: Persistence ----
            logger.info(f"Phase 2: Persist {len(collected)} opportunities")
            try:
                db_result = await self.agents["database_update"].execute(
                    db, user_id=user_id, opportunities=collected
                )
                results["database_update"] = db_result
            except Exception as e:
                results["database_update"] = {"status": "failed", "error": str(e)}
                logger.error(f"database update failed: {e}")

            # ---- Phase 3: Eligibility ----
            logger.info("Phase 3: Eligibility Check")
            try:
                eligibility_result = await self.agents["eligibility"].execute(
                    db, user_id=user_id
                )
                results["eligibility"] = eligibility_result
            except Exception as e:
                results["eligibility"] = {"status": "failed", "error": str(e)}
                logger.error(f"eligibility check failed: {e}")

            # ---- Phase 4: Deduplication ----
            logger.info("Phase 4: Duplicate Removal")
            try:
                dedup_result = await self.agents["duplicate_removal"].execute(db)
                results["duplicate_removal"] = dedup_result
            except Exception as e:
                results["duplicate_removal"] = {"status": "failed", "error": str(e)}
                logger.error(f"duplicate removal failed: {e}")

            # ---- Phase 5: AI Matching ----
            logger.info("Phase 5: AI Matching")
            try:
                matching_result = await self.agents["ai_matching"].execute(
                    db, user_id=user_id
                )
                results["ai_matching"] = matching_result
            except Exception as e:
                results["ai_matching"] = {"status": "failed", "error": str(e)}
                logger.error(f"AI matching failed: {e}")

            # ---- Phase 6: Curation ----
            logger.info("Phase 6: Recommendations")
            try:
                recommendation_result = await self.agents["recommendation"].execute(
                    db, user_id=user_id
                )
                results["recommendation"] = recommendation_result
            except Exception as e:
                results["recommendation"] = {"status": "failed", "error": str(e)}
                logger.error(f"recommendation failed: {e}")

            # ---- Phase 7: Notifications ----
            logger.info("Phase 7: Notifications")
            try:
                notif_result = await self.agents["notification"].execute(
                    db, user_id=user_id
                )
                results["notification"] = notif_result
            except Exception as e:
                results["notification"] = {"status": "failed", "error": str(e)}
                logger.error(f"notification failed: {e}")

            summary = {
                "workflow": workflow_type,
                "phases": results,
                "overall_status": "completed",
            }

            await self.complete_log(db, output_data=summary)
            return summary

        except Exception as e:
            await self.complete_log(db, error=str(e))
            raise
