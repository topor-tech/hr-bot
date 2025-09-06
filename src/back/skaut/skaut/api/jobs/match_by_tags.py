"""CV matching endpoint for finding CVs that match a vacancy by common tags."""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, literal_column

from skaut.database import get_async_db
from skaut.orm import Vacancy, CV


router = APIRouter(prefix="", tags=["jobs"])


class CVMatchResponse(BaseModel):
    """Response model for CV match results."""
    id: int
    name: str
    uploaded_at: str
    common_tags: List[str]
    common_tags_count: int


class CVMatchListResponse(BaseModel):
    """Response model for CV match list."""
    matches: List[CVMatchResponse]


@router.get("/api/jobs/match-by-tags/{vacancy_id}", response_model=CVMatchListResponse)
async def match_cvs_by_tags(
    vacancy_id: int,
    session: AsyncSession = Depends(get_async_db)
) -> CVMatchListResponse:
    """
    Match CVs to a vacancy based on common tags.
    
    Args:
        vacancy_id: The ID of the vacancy to match against
        session: Database session dependency
        
    Returns:
        CVMatchListResponse object containing top 10 matching CVs
        
    Raises:
        HTTPException: If vacancy with given ID is not found
    """
    # First, get the vacancy to ensure it exists and get its tags
    vacancy_result = await session.execute(
        select(Vacancy.id, Vacancy.name, Vacancy.tags)
        .where(Vacancy.id == vacancy_id)
    )
    vacancy = vacancy_result.one_or_none()
    
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    
    vacancy_tags = vacancy.tags or []
    
    # If vacancy has no tags, return empty result
    if not vacancy_tags:
        return CVMatchListResponse(
            vacancy_id=vacancy.id,
            vacancy_name=vacancy.name,
            vacancy_tags=[],
            total_cvs_matched=0,
            matches=[]
        )
    
    # Pure SQL solution: unnest vacancy tags, join with CV tags, group and count
    cv_results = await session.execute(
        select(
            CV.id,
            CV.name,
            CV.uploaded_at,
            func.count(literal_column('vacancy_tags_unnested.tag')).label('common_tags_count'),
            func.array_agg(literal_column('vacancy_tags_unnested.tag')).label('common_tags')
        )
        .select_from(
            # First unnest vacancy tags
            select(
                func.unnest(Vacancy.tags).label('tag')
            )
            .where(Vacancy.id == vacancy_id)
            .subquery()
            .alias('vacancy_tags_unnested')
        )
        .join(
            CV,
            literal_column('vacancy_tags_unnested.tag = ANY(CV.tags)')
        )
        .group_by(CV.id)
        .order_by(func.count(literal_column('vacancy_tags_unnested.tag')).desc())
        .limit(10)
    )
    
    # Convert results to response models
    matches = []
    for cv in cv_results:
        matches.append(CVMatchResponse(
            id=cv.id,
            name=cv.name,
            uploaded_at=cv.uploaded_at.isoformat(),
            common_tags=cv.common_tags or [],
            common_tags_count=cv.common_tags_count or 0,
        ))
    
    return CVMatchListResponse(
        matches=matches
    )
