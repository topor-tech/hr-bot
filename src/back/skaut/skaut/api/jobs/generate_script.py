"""Interview script generation endpoint for creating LLM voice interview scripts."""

import json
import logging
from typing import Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from skaut.database import get_async_db
from skaut.orm.vacancy import Vacancy
from skaut.orm.interview_script import InterviewScript
from skaut.lib.cv_extractor import CVTextExtractor
from skaut.lib.gpt_prompts import get_interview_script_generation_prompt


router = APIRouter(prefix="", tags=["jobs"])


class GenerateScriptResponse(BaseModel):
    """Response model for interview script generation."""
    success: bool
    message: str
    script_id: Optional[int] = None
    script_data: Optional[Dict[str, Any]] = None


class InterviewScriptGenerator:
    """Generate interview scripts using GPT based on vacancy data."""
    
    def __init__(self):
        self.client = CVTextExtractor().client
    
    async def generate_script(self, vacancy_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate interview script based on vacancy information."""
        
        # Prepare the prompt with vacancy data
        vacancy_context = f"""
        Job Position: {vacancy_data.get('name', 'Unknown Position')}
        Job Description: {vacancy_data.get('extracted_text', 'No description available')}
        Required Skills: {', '.join(vacancy_data.get('tags', []))}
        """
        
        prompt_text = f"{vacancy_context}\n\n{get_interview_script_generation_prompt()}"
        
        resp = await self.client.responses.create(
            model="gpt-5",
            input=[{
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": prompt_text
                    }
                ]
            }],
            max_output_tokens=4000
        )
        
        response_text = resp.output_text or ""
        logging.info(f"Interview script generation response length: {len(response_text)}")
        logging.debug(f"Interview script generation response: {response_text[:500]}...")
        
        if not response_text.strip():
            logging.error("Empty response from GPT")
            raise HTTPException(
                status_code=500, 
                detail="Empty response from AI service"
            )
        
        try:
            # Try to clean the response text before parsing
            cleaned_text = response_text.strip()
            
            # Remove any text before the first { and after the last }
            start_idx = cleaned_text.find('{')
            end_idx = cleaned_text.rfind('}')
            
            if start_idx == -1 or end_idx == -1 or start_idx >= end_idx:
                logging.error(f"No valid JSON structure found in response: {cleaned_text[:200]}...")
                raise HTTPException(
                    status_code=500, 
                    detail="No valid JSON structure found in AI response"
                )
            
            json_text = cleaned_text[start_idx:end_idx + 1]
            script_data = json.loads(json_text)
            
            # Validate that we have the required structure
            if not isinstance(script_data, dict):
                raise ValueError("Response is not a JSON object")
            
            required_keys = ["interview_metadata", "opening", "sections", "evaluation_rubric", "closing"]
            missing_keys = [key for key in required_keys if key not in script_data]
            if missing_keys:
                logging.warning(f"Missing required keys in response: {missing_keys}")
            
            return script_data
            
        except json.JSONDecodeError as e:
            logging.error(f"Failed to parse GPT response as JSON: {e}")
            logging.error(f"Response text (first 1000 chars): {response_text[:1000]}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to generate valid interview script from AI response: {str(e)}"
            )
        except Exception as e:
            logging.error(f"Unexpected error processing GPT response: {e}")
            raise HTTPException(
                status_code=500, 
                detail=f"Unexpected error processing AI response: {str(e)}"
            )


@router.post("/api/jobs/generate-script/{vacancy_id}", response_model=GenerateScriptResponse)
async def generate_interview_script(
    vacancy_id: int,
    session: AsyncSession = Depends(get_async_db)
) -> GenerateScriptResponse:
    """
    Generate an interview script for a specific vacancy.
    
    This endpoint:
    1. Retrieves vacancy information including extracted text and tags
    2. Uses GPT to generate a comprehensive interview script
    3. Saves the script to the database
    4. Returns the generated script data
    
    Args:
        vacancy_id: ID of the vacancy to generate script for
        session: Database session
        
    Returns:
        GenerateScriptResponse with success status and script data
    """
    
    # 1. Get vacancy record
    vacancy_result = await session.execute(
        select(Vacancy).where(Vacancy.id == vacancy_id)
    )
    vacancy: Vacancy = vacancy_result.scalar_one_or_none()
    
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    
    # 2. Check if vacancy has extracted text or tags
    if not vacancy.extracted_text and not vacancy.tags:
        raise HTTPException(
            status_code=400, 
            detail="Vacancy must have extracted text or tags to generate interview script. Please process the vacancy first."
        )
    
    # 3. Prepare vacancy data for script generation
    vacancy_data = {
        "name": vacancy.name,
        "extracted_text": vacancy.extracted_text or "",
        "tags": vacancy.tags or []
    }
    
    # 4. Generate interview script using GPT
    script_generator = InterviewScriptGenerator()
    try:
        script_data = await script_generator.generate_script(vacancy_data)
    except Exception as e:
        logging.error(f"Failed to generate interview script: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate interview script: {str(e)}"
        )
    
    # 5. Save script to database
    interview_script = InterviewScript(
        vacancy_id=vacancy_id,
        script=script_data
    )
    
    session.add(interview_script)
    await session.commit()
    await session.refresh(interview_script)
    
    logging.info(f"Generated interview script with ID {interview_script.id} for vacancy {vacancy_id}")
    
    return GenerateScriptResponse(
        success=True,
        message="Interview script generated successfully",
        script_id=interview_script.id,
        script_data=script_data
    )
