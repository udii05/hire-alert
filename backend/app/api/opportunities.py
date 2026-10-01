import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.database import get_db
from app.models.models import Opportunity
from app.core.security import verify_api_key

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/opportunities",
    tags=["opportunities"],
    dependencies=[Depends(verify_api_key)],
)


@router.get("")
async def list_opportunities(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    type: str = Query(None),
    active: bool = Query(True),
    db: AsyncSession = Depends(get_db),
):
    """List opportunities with optional filtering."""
    query = select(Opportunity).where(Opportunity.isActive == active)

    if type:
        query = query.where(Opportunity.type == type)

    query = query.order_by(desc(Opportunity.createdAt)).offset(offset).limit(limit)

    result = await db.execute(query)
    opportunities = result.scalars().all()

    return {
        "opportunities": [opp.to_dict() for opp in opportunities],
        "total": len(opportunities),
        "limit": limit,
        "offset": offset,
    }


@router.get("/{opportunity_id}")
async def get_opportunity(
    opportunity_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a single opportunity by ID."""
    result = await db.execute(
        select(Opportunity).where(Opportunity.id == opportunity_id)
    )
    opportunity = result.scalar_one_or_none()

    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    return opportunity.to_dict()
