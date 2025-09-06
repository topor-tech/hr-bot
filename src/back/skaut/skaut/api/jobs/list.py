"""Vacancy list endpoint for retrieving all vacancies from database."""

from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from skaut.database import get_async_db
from skaut.orm.vacancy import Vacancy

router = APIRouter(prefix="", tags=["jobs"])


class VacancyResponse(BaseModel):
    """Response model for vacancy list endpoint."""
    id: int
    name: str
    created_at: datetime


@router.get("/api/jobs/list", response_model=list[VacancyResponse])
async def list_vacancies(
    session: AsyncSession = Depends(get_async_db)
) -> list[VacancyResponse]:
    """
    Get a list of all vacancies from the database.
    
    Args:
        session: Database session dependency
        
    Returns:
        List of VacancyResponse objects containing vacancy information
    """
    # Query all vacancies from database
    result = await session.execute(
        select(
            Vacancy.id,
            Vacancy.name,
            Vacancy.created_at,
        ).order_by(
            Vacancy.id.desc()
        )
    )
    vacancies = result.all()
    
    # Convert to response models
    return [
        VacancyResponse(
            id=vacancy.id,  # type: ignore
            name=vacancy.name,  # type: ignore
            created_at=vacancy.created_at,  # type: ignore
        )
        for vacancy in vacancies
    ]
