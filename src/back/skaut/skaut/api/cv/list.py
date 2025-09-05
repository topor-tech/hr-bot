"""CV list endpoint for retrieving all CVs from database."""

from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from skaut.database import get_async_db
from skaut.orm.cv import CV

router = APIRouter(prefix="", tags=["cv"])


class CVResponse(BaseModel):
    """Response model for CV list endpoint."""
    id: int
    name: str
    uploaded_at: datetime
    file_id: int
    pdf_file_id: int | None


@router.get("/api/cv/list", response_model=list[CVResponse])
async def list_cvs(
    session: AsyncSession = Depends(get_async_db)
) -> list[CVResponse]:
    """
    Get a list of all CVs from the database.
    
    Args:
        session: Database session dependency
        
    Returns:
        List of CVResponse objects containing CV information
    """
    # Query all CVs from database
    result = await session.execute(
        select(
            CV.id,
            CV.name,
            CV.uploaded_at,
            CV.file_id,
            CV.pdf_file_id
        ).order_by(
            CV.id.desc()
        )
    )
    cvs = result.all()
    
    # Convert to response models
    return [
        CVResponse(
            id=cv.id,  # type: ignore
            name=cv.name,  # type: ignore
            uploaded_at=cv.uploaded_at,  # type: ignore
            file_id=cv.file_id,  # type: ignore
            pdf_file_id=cv.pdf_file_id,  # type: ignore
        )
        for cv in cvs
    ]
