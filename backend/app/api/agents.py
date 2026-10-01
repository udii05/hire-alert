import logging
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.database import get_db
from app.agents.orchestrator import OrchestratorAgent
from app.core.security import verify_api_key

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agents", tags=["agents"])


class TriggerWorkflow(BaseModel):
    user_id: str
    workflow_type: str = "full_refresh"


class WorkflowStatus(BaseModel):
    job_id: str
    status: str
    progress: Optional[dict] = None


@router.post("/trigger")
async def trigger_workflow(
    request: TriggerWorkflow,
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(verify_api_key),
):
    """Trigger the full AI agent workflow for a user."""
    try:
        orchestrator = OrchestratorAgent()
        result = await orchestrator.execute(
            db,
            user_id=request.user_id,
            workflow_type=request.workflow_type,
        )

        return {
            "success": True,
            "workflow_id": orchestrator.log_id,
            "result": result,
        }
    except Exception as e:
        logger.error(f"Workflow trigger failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Workflow execution failed: {str(e)}"
        )


@router.get("/status/{log_id}")
async def get_workflow_status(
    log_id: str,
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(verify_api_key),
):
    """Get the status of a workflow execution."""
    from sqlalchemy import select
    from app.models.models import AgentLog

    result = await db.execute(select(AgentLog).where(AgentLog.id == log_id))
    log = result.scalar_one_or_none()

    if not log:
        raise HTTPException(status_code=404, detail="Workflow not found")

    return {
        "id": log.id,
        "agent_name": log.agentName,
        "status": log.status,
        "error": log.error,
        "started_at": log.startedAt.isoformat() if log.startedAt else None,
        "completed_at": log.completedAt.isoformat() if log.completedAt else None,
        "output": log.output,
    }


@router.get("/logs")
async def get_recent_logs(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """Get recent agent execution logs."""
    from sqlalchemy import select, desc
    from app.models.models import AgentLog

    result = await db.execute(
        select(AgentLog)
        .order_by(desc(AgentLog.startedAt))
        .limit(limit)
    )
    logs = result.scalars().all()

    return {
        "logs": [log.to_dict() for log in logs],
        "total": len(logs),
    }
