from fastapi import APIRouter
from pydantic import BaseModel

from skaut.lib.cv_extractor import extract_cv_text


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
