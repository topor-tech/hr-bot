"""CV info endpoint for retrieving CV details by ID."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import aliased

from skaut.database import get_async_db
from skaut.orm import CV, File

router = APIRouter(prefix="", tags=["cv"])

PDFFile = aliased(File)


class CVResponse(BaseModel):
    """Response model for CV info endpoint."""
    id: int
    name: str
    uploaded_at: datetime
    file_id: int
    file_original_filename: str | None
    file_s3_key: str | None
    file_extension: str | None
    pdf_file_id: int | None
    pdf_file_original_filename: str | None
    pdf_file_s3_key: str | None
    pdf_file_extension: str | None
    extracted_text: str | None
    phone_number: str | None
    email: str | None
    telegram: str | None
    tags: list[str] | None


@router.get("/api/cv/info/{cv_id}", response_model=CVResponse)
async def get_cv_by_id(
    cv_id: int,
    session: AsyncSession = Depends(get_async_db)
) -> CVResponse:
    """
    Get CV information by ID.
    
    Args:
        cv_id: The ID of the CV to retrieve
        session: Database session dependency
        
    Returns:
        CVResponse object containing CV information
        
    Raises:
        HTTPException: If CV with given ID is not found
    """
    # Query CV by ID
    result = await session.execute(
        select(
            CV.id,
            CV.name,
            CV.uploaded_at,
            CV.file_id,
            CV.pdf_file_id,
            CV.extracted_text,
            CV.phone_number,
            CV.email,
            CV.telegram,
            CV.tags,
            File.original_filename,
            File.extension,
            File.s3_key,
            PDFFile.original_filename.label("pdf_original_filename"),
            PDFFile.extension.label("pdf_extension"),
            PDFFile.s3_key.label("pdf_s3_key"),
        ).join(
            File,
            CV.file_id == File.id,
        ).outerjoin(
           PDFFile,
            CV.pdf_file_id == PDFFile.id,
        ).where(CV.id == cv_id)
    )
    cv = result.one_or_none()
    
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    
    # Convert to response model
    return CVResponse(
        id=cv.id,  # type: ignore
        name=cv.name,  # type: ignore
        uploaded_at=cv.uploaded_at,  # type: ignore
        file_id=cv.file_id,  # type: ignore
        pdf_file_id=cv.pdf_file_id,  # type: ignore
        file_original_filename=cv.original_filename,  # type: ignore
        file_extension=cv.extension,  # type: ignore
        file_s3_key=str(cv.s3_key),  # type: ignore
        pdf_file_original_filename=cv.pdf_original_filename,  # type: ignore
        pdf_file_s3_key=str(cv.pdf_s3_key),  # type: ignore
        pdf_file_extension=cv.pdf_extension,  # type: ignore
        extracted_text=cv.extracted_text,  # type: ignore
        phone_number=cv.phone_number,  # type: ignore
        email=cv.email,  # type: ignore
        telegram=cv.telegram,  # type: ignore
        tags=cv.tags,  # type: ignore
    )
