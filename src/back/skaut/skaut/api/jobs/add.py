"""Vacancy add endpoint for uploading vacancy files to S3 and saving records to database."""
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from skaut.lib.s3 import upload_file_to_s3
from skaut.database import get_async_db
from skaut.orm.file import File as FileModel
from skaut.orm.vacancy import Vacancy

router = APIRouter(prefix="", tags=["jobs"])


class AddVacancyResponse(BaseModel):
    """Response model for vacancy add endpoint."""
    vacancy_id: int
    file_id: int
    s3_key: str


@router.post("/api/jobs/add")
async def add_vacancy(
    file: UploadFile = File(...),
    name: str | None = None,
    session: AsyncSession = Depends(get_async_db)
) -> AddVacancyResponse:
    """
    Add a vacancy file to S3 and save record in database.
    
    Args:
        file: The vacancy file to upload
        name: Optional name for the vacancy (defaults to filename without extension)
        session: Database session dependency
        
    Returns:
        AddVacancyResponse with vacancy ID, file ID, S3 key, and success message
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename is required")
        
        # Read file content
        content = await file.read()
        content_type = file.content_type or "application/octet-stream"
        filename = file.filename
        
        # Generate vacancy name if not provided
        if not name:
            name = Path(filename).stem
        
        # Upload file to S3
        s3_key = await upload_file_to_s3(filename, content, content_type)
        
        # Create File record in database
        file_record = FileModel(
            original_filename=filename,
            extension=Path(filename).suffix.lower(),
            s3_key=s3_key,
            content_type=content_type,
            file_size=len(content)
        )
        
        session.add(file_record)
        await session.flush()  # Flush to get the file ID
        
        # Create Vacancy record in database
        vacancy_record = Vacancy(
            name=name,
            file_id=file_record.id
        )
        
        session.add(vacancy_record)
        await session.commit()
        
        # Refresh to get the actual ID values
        await session.refresh(file_record)
        await session.refresh(vacancy_record)
        
        return AddVacancyResponse(
            vacancy_id=vacancy_record.id,  # type: ignore
            file_id=file_record.id,  # type: ignore
            s3_key=s3_key,
        )
    
    finally:
        await file.close()
