"""CV extraction endpoint for processing CV files."""

import json
import logging
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from skaut.database import get_async_db
from skaut.orm.cv import CV
from skaut.orm.file import File
from skaut.lib.cv_extractor import CVTextExtractor
from skaut.lib.gpt_prompts import get_contact_extraction_prompt, get_skills_extraction_prompt


router = APIRouter(prefix="", tags=["cv"])


class ExtractCVResponse(BaseModel):
    """Response model for CV extraction."""
    success: bool
    message: str
    extracted_data: Optional[Dict[str, Any]] = None


class ContactInfoExtractor:
    """Extract contact information from CV text using GPT."""
    
    def __init__(self):
        self.client = CVTextExtractor().client
    
    async def extract_contact_info(self, cv_text: str) -> Dict[str, Optional[str]]:
        """Extract contact information from CV text."""

        resp = await self.client.responses.create(
            model="gpt-5",
            input=[{
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": f"CV Text:\n{cv_text}\n\n{get_contact_extraction_prompt()}"
                    }
                ]
            }],
            max_output_tokens=1000
        )
        logging.info(f"Contact info extraction response: {resp.output_text}")
        result = json.loads(resp.output_text or "{}")
        return {
            "email": result.get("email"),
            "phone": result.get("phone"),
            "telegram": result.get("telegram")
        }



class SkillsExtractor:
    """Extract skills and tags from CV text using GPT."""
    
    def __init__(self):
        self.client = CVTextExtractor().client
    
    async def extract_skills(self, cv_text: str) -> List[str]:
        """Extract skills and tags from CV text."""
        resp = await self.client.responses.create(
            model="gpt-5",
            input=[{
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": f"CV Text:\n{cv_text}\n\n{get_skills_extraction_prompt()}"
                    }
                ]
            }],
            max_output_tokens=2000
        )
        logging.info(f"Skills extraction response: {resp.output_text}")
        result = json.loads(resp.output_text or "{}")
        return result.get("skills", [])


@router.post("/api/cv/extract/{cv_id}", response_model=ExtractCVResponse)
async def extract_cv(
    cv_id: int,
    session: AsyncSession = Depends(get_async_db)
) -> ExtractCVResponse:
    """
    Extract text and metadata from a CV file.
    
    This endpoint:
    1. Checks if CV has a PDF file
    2. Extracts text from the PDF
    3. Saves text to database
    4. Extracts contact information (email, phone, telegram)
    5. Extracts skills and tags
    6. Updates the CV record with all extracted data
    """

    # 1. Get CV record and check if it has a PDF file
    cv_result = await session.execute(
        select(CV).where(CV.id == cv_id)
    )
    cv: CV = cv_result.scalar_one_or_none()
    
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    
    if cv.pdf_file_id is None:
        raise HTTPException(
            status_code=400, 
            detail="CV does not have a PDF file. Please upload a PDF first."
        )
    
    # 2. Get PDF file information
    pdf_file_result = await session.execute(
        select(File).where(File.id == cv.pdf_file_id)
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
    setattr(cv, 'extracted_text', extracted_text)
    
    # 5. Extract contact information
    contact_extractor = ContactInfoExtractor()
    contact_info = await contact_extractor.extract_contact_info(extracted_text)
    logging.info(f"Contact info: {contact_info}")
    
    # Update contact fields in database
    if contact_info.get("email"):
        setattr(cv, 'email', contact_info["email"])
    if contact_info.get("phone"):
        setattr(cv, 'phone_number', contact_info["phone"])
    if contact_info.get("telegram"):
        setattr(cv, 'telegram', contact_info["telegram"])
    
    # 6. Extract skills and tags
    skills_extractor = SkillsExtractor()
    skills = await skills_extractor.extract_skills(extracted_text)
    logging.info(f"Skills: {skills}")
    # Update skills/tags in database
    if skills:
        setattr(cv, 'tags', skills)
        
    # 7. Save all changes to database
    await session.commit()
    
    return ExtractCVResponse(
        success=True,
        message="CV extraction completed successfully",
        extracted_data={
            "text_length": len(extracted_text),
            "contact_info": contact_info,
            "skills_count": len(skills),
            "skills": skills
        }
    )
    
