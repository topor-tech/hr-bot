import aiohttp
import tempfile
import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from skaut.lib.s3 import download_file_from_s3, upload_file_to_s3
from skaut.config import settings

router = APIRouter(prefix="", tags=["preprocess"])


class ConvertToPDFRequest(BaseModel):
    """Request model for CV text extraction."""
    s3_key: str


class ConvertToPDFResponse(BaseModel):
    """Response model for CV text extraction."""
    s3_key: str


async def convert_to_pdf_with_gotenberg(file_path: str, original_filename: str) -> str:
    """Convert a document to PDF using Gotenberg.
    
    Args:
        file_path: Path to the local file to convert
        original_filename: Original filename for the converted file
        
    Returns:
        Path to the converted PDF file
    """
    # Create output filename with .pdf extension
    output_path = tempfile.mktemp(suffix=".pdf")
    
    try:
        async with aiohttp.ClientSession() as session:
            # Prepare the form data
            with open(file_path, 'rb') as file:
                form_data = aiohttp.FormData()
                form_data.add_field('files', file, filename=original_filename)
                
                # Make the request to Gotenberg
                async with session.post(
                    f"{settings.GOTENBERG_URL}/forms/libreoffice/convert",
                    data=form_data
                ) as response:
                    if response.status != 200:
                        raise HTTPException(
                            status_code=500, 
                            detail=f"Gotenberg conversion failed with status {response.status}"
                        )
                    
                    # Save the converted PDF
                    with open(output_path, 'wb') as pdf_file:
                        async for chunk in response.content.iter_chunked(8192):
                            pdf_file.write(chunk)
                    
                    return output_path
    except aiohttp.ClientError as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect to Gotenberg: {str(e)}")


@router.post("/api/preprocess/convert-to-pdf", response_model=ConvertToPDFResponse)
async def convert_to_pdf_endpoint(request: ConvertToPDFRequest) -> ConvertToPDFResponse:
    """Convert a document to PDF using Gotenberg."""
    local_file_path, original_filename = await download_file_from_s3(request.s3_key)
    file_extension = original_filename.split(".")[-1].lower()
    
    try:
        # If already PDF, return the original S3 key
        if file_extension == "pdf":
            return ConvertToPDFResponse(s3_key=request.s3_key)
        
        # Check if file type is supported for conversion
        if file_extension in ("doc", "docx", "rtf"):
            pdf_file_path = await convert_to_pdf_with_gotenberg(local_file_path, original_filename)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file extension: {file_extension}")
        
        # Generate new S3 key for the converted PDF
        pdf_filename = Path(original_filename).stem + ".pdf"
        
        # Upload converted PDF to S3
        with open(pdf_file_path, "rb") as pdf_file:
            uploaded_s3_key = await upload_file_to_s3(pdf_filename, pdf_file.read(), "application/pdf")
        
        return ConvertToPDFResponse(s3_key=uploaded_s3_key)
        
    finally:
        # Clean up temporary files
        if os.path.exists(local_file_path):
            os.unlink(local_file_path)
        if 'pdf_file_path' in locals() and os.path.exists(pdf_file_path):
            os.unlink(pdf_file_path)