import os
from fastapi import APIRouter
from pydantic import BaseModel

from openai import AsyncOpenAI

from skaut.config import settings
from skaut.lib.s3 import download_file_from_s3


class CVTextExtractor:
    """Extract text from CV files stored in S3 using OpenAI agents."""
    
    def __init__(self):
        """Initialize the CV text extractor."""
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
    
    async def extract_text_from_cv(self, s3_key: str) -> str:
        local_file_path, _original_filename = await download_file_from_s3(s3_key)

        try:
            # 1) Upload the file with purpose="user_data" (for direct model input)
            #    (Use "assistants" only for Assistants API / vector stores.)
            with open(local_file_path, "rb") as f:
                uploaded = await self.client.files.create(
                    file=f,
                    purpose="user_data"
                )

            # 2) Call Responses API and pass the file as an `input_file`
            resp = await self.client.responses.create(
                model="gpt-5",  # or "gpt-4.1" / "gpt-4o" (must support file inputs)
                input=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "input_file",
                            "file_id": uploaded.id
                        },
                        {
                            "type": "input_text",
                            "text": (
                                "You are a CV text extraction specialist. "
                                "Extract all readable text content from the attached CV file "
                                "(likely Russian). Preserve structure and headings. "
                                "Return only the extracted text."
                            )
                        }
                    ]
                }],
                max_output_tokens=40000  # analogous to max_tokens
            )

            extracted_text = resp.output_text or ""
            return extracted_text.strip()

        finally:
            # Best-effort cleanup
            try:
                if 'uploaded' in locals():
                    await self.client.files.delete(uploaded.id)
            except Exception:
                pass
            try:
                os.unlink(local_file_path)
            except Exception:
                pass


async def extract_cv_text(s3_key: str) -> str:
    """Convenience function to extract text from a CV pdf file.
    
    Args:
        s3_key: S3 key of the CV file
        
    Returns:
        Extracted text from the CV file
    """
    extractor = CVTextExtractor()
    return await extractor.extract_text_from_cv(s3_key)


router = APIRouter(prefix="", tags=["preprocess"])


class ExtractCVRequest(BaseModel):
    """Request model for CV text extraction."""
    s3_key: str


class ExtractCVResponse(BaseModel):
    """Response model for CV text extraction."""
    extracted_text: str
    s3_key: str


@router.post("/api/preprocess/extract-cv", response_model=ExtractCVResponse)
async def extract_cv_endpoint(request: ExtractCVRequest) -> ExtractCVResponse:
    extracted_text = await extract_cv_text(request.s3_key)
    return ExtractCVResponse(
        extracted_text=extracted_text,
        s3_key=request.s3_key
    )
