"""Vacancy info endpoint for retrieving vacancy details by ID."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import aliased

from skaut.database import get_async_db
from skaut.orm import Vacancy, File

router = APIRouter(prefix="", tags=["jobs"])

PDFFile = aliased(File)


class VacancyResponse(BaseModel):
    """Response model for vacancy info endpoint."""
    id: int
    name: str
    created_at: datetime
    tags: list[str] | None
    file_id: int | None
    file_original_filename: str | None
    file_s3_key: str | None
    file_extension: str | None
    pdf_file_id: int | None
    pdf_file_original_filename: str | None
    pdf_file_s3_key: str | None
    pdf_file_extension: str | None
    extracted_text: str | None


@router.get("/api/jobs/info/{vacancy_id}", response_model=VacancyResponse)
async def get_vacancy_by_id(
    vacancy_id: int,
    session: AsyncSession = Depends(get_async_db)
) -> VacancyResponse:
    """
    Get vacancy information by ID.
    
    Args:
        vacancy_id: The ID of the vacancy to retrieve
        session: Database session dependency
        
    Returns:
        VacancyResponse object containing vacancy information
        
    Raises:
        HTTPException: If vacancy with given ID is not found
    """
    # Query vacancy by ID
    result = await session.execute(
        select(
            Vacancy.id,
            Vacancy.name,
            Vacancy.created_at,
            Vacancy.file_id,
            Vacancy.pdf_file_id,
            Vacancy.extracted_text,
            Vacancy.tags,
            File.original_filename,
            File.extension,
            File.s3_key,
            PDFFile.original_filename.label("pdf_original_filename"),
            PDFFile.extension.label("pdf_extension"),
            PDFFile.s3_key.label("pdf_s3_key"),
        ).outerjoin(
            File,
            Vacancy.file_id == File.id,
        ).outerjoin(
           PDFFile,
            Vacancy.pdf_file_id == PDFFile.id,
        ).where(Vacancy.id == vacancy_id)
    )
    vacancy = result.one_or_none()
    
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    
    # Convert to response model
    return VacancyResponse(
        id=vacancy.id,  # type: ignore
        name=vacancy.name,  # type: ignore
        created_at=vacancy.created_at,  # type: ignore
        file_id=vacancy.file_id,  # type: ignore
        pdf_file_id=vacancy.pdf_file_id,  # type: ignore
        file_original_filename=vacancy.original_filename,  # type: ignore
        file_extension=vacancy.extension,  # type: ignore
        file_s3_key=str(vacancy.s3_key) if vacancy.s3_key else None,  # type: ignore
        pdf_file_original_filename=vacancy.pdf_original_filename,  # type: ignore
        pdf_file_s3_key=str(vacancy.pdf_s3_key) if vacancy.pdf_s3_key else None,  # type: ignore
        pdf_file_extension=vacancy.pdf_extension,  # type: ignore
        extracted_text=vacancy.extracted_text,  # type: ignore
        tags=vacancy.tags,  # type: ignore
    )
