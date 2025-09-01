import aioboto3  # type: ignore[import]
import base64
import tempfile
import os
from pathlib import Path
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Dict, List

from openai import AsyncOpenAI

from skaut.config import settings


class CVTextExtractor:
    """Extract text from CV files stored in S3 using OpenAI agents."""
    
    def __init__(self):
        """Initialize the CV text extractor."""
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.session = aioboto3.Session()
        
    async def download_file_from_s3(self, s3_key: str) -> tuple[str, str]:
        """Download a file from S3 to a temporary local file.
        
        Args:
            s3_key: S3 key of the file to download
            
        Returns:
            Tuple of (path to the temporary local file, original filename)
        """
        async with self.session.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        ) as s3_client:
            # Get file metadata to retrieve original filename
            response = await s3_client.head_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=s3_key
            )
            
            # Decode original filename from metadata
            encoded_filename = response.get('Metadata', {}).get('original-filename-b64', '')
            original_filename = ''
            if encoded_filename:
                try:
                    original_filename = base64.b64decode(encoded_filename.encode('ascii')).decode('utf-8')
                except Exception:
                    # Fallback to using s3_key if decoding fails
                    original_filename = s3_key
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=Path(original_filename).suffix) as temp_file:
                await s3_client.download_file(
                    settings.S3_BUCKET_NAME,
                    s3_key,
                    temp_file.name
                )
                return temp_file.name, original_filename
    
    async def extract_text_from_cv(self, s3_key: str) -> str:
        local_file_path, _original_filename = await self.download_file_from_s3(s3_key)

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
    """Convenience function to extract text from a CV file.
    
    Args:
        s3_key: S3 key of the CV file
        
    Returns:
        Extracted text from the CV file
    """
    extractor = CVTextExtractor()
    return await extractor.extract_text_from_cv(s3_key)


router = APIRouter(prefix="/preprocess", tags=["preprocess"])


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
