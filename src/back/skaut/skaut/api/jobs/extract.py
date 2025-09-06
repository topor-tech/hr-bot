"""Vacancy extraction endpoint for processing vacancy files."""

import json
import logging
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from skaut.database import get_async_db
from skaut.orm.vacancy import Vacancy
from skaut.orm.file import File
from skaut.lib.cv_extractor import CVTextExtractor
from skaut.lib.gpt_prompts import get_job_extraction_prompt


router = APIRouter(prefix="", tags=["jobs"])


class ExtractVacancyResponse(BaseModel):
    """Response model for vacancy extraction."""
    success: bool
    message: str
    extracted_data: Optional[Dict[str, Any]] = None


class JobTagsExtractor:
    """Extract job tags and requirements from vacancy text using GPT."""
    
    def __init__(self):
        self.client = CVTextExtractor().client
    
    async def extract_job_tags(self, vacancy_text: str) -> List[str]:
        """Extract job tags and requirements from vacancy text."""
        
        job_extraction_prompt = get_job_extraction_prompt()
        
        resp = await self.client.responses.create(
            model="gpt-5",
            input=[{
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": f"Job Vacancy Text:\n{vacancy_text}\n\n{job_extraction_prompt}"
                    }
                ]
            }],
            max_output_tokens=2000
        )
        logging.info(f"Job tags extraction response: {resp.output_text}")
        result = json.loads(resp.output_text or "{}")
        return result.get("skills", [])


@router.post("/api/jobs/extract/{vacancy_id}", response_model=ExtractVacancyResponse)
async def extract_vacancy(
    vacancy_id: int,
    session: AsyncSession = Depends(get_async_db)
) -> ExtractVacancyResponse:
    """
    Extract text and metadata from a vacancy file.
    
    This endpoint:
    1. Checks if vacancy has a PDF file
    2. Extracts text from the PDF
    3. Saves text to database
    4. Extracts job tags and requirements
    5. Updates the vacancy record with all extracted data
    """

    # 1. Get vacancy record and check if it has a PDF file
    vacancy_result = await session.execute(
        select(Vacancy).where(Vacancy.id == vacancy_id)
    )
    vacancy: Vacancy = vacancy_result.scalar_one_or_none()
    
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    
    if vacancy.pdf_file_id is None:
        raise HTTPException(
            status_code=400, 
            detail="Vacancy does not have a PDF file. Please upload a PDF first."
        )
    
    # 2. Get PDF file information
    pdf_file_result = await session.execute(
        select(File).where(File.id == vacancy.pdf_file_id)
    )
    pdf_file: File = pdf_file_result.scalar_one_or_none()
    
    if not pdf_file:
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    # 3. Extract text from PDF
    cv_extractor = CVTextExtractor()
    extracted_text = await cv_extractor.extract_text_from_cv(str(pdf_file.s3_key))
    
    if not extracted_text:
        raise HTTPException(status_code=500, detail="Failed to extract text from PDF")
    logging.info(f"Extracted text: {extracted_text}")
    
    # 4. Save extracted text to database
    setattr(vacancy, 'extracted_text', extracted_text)
    
    # 5. Extract job tags and requirements
    job_tags_extractor = JobTagsExtractor()
    job_tags = await job_tags_extractor.extract_job_tags(extracted_text)
    logging.info(f"Job tags: {job_tags}")
    
    # Update tags in database
    if job_tags:
        setattr(vacancy, 'tags', job_tags)
        
    # 6. Save all changes to database
    await session.commit()
    
    return ExtractVacancyResponse(
        success=True,
        message="Vacancy extraction completed successfully",
        extracted_data={
            "text_length": len(extracted_text),
            "tags_count": len(job_tags),
            "tags": job_tags
        }
    )
