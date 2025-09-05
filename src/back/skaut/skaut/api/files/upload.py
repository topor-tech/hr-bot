from typing import Any, Dict

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from skaut.lib.s3 import upload_file_to_s3

router = APIRouter(prefix="", tags=["files"])

class UploadFileResponse(BaseModel):
    s3_key: str


@router.post("/api/files/upload")
async def upload_file(file: UploadFile = File(...)) -> UploadFileResponse:
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename is required")
        
        filename = file.filename
        content = await file.read()
        content_type = file.content_type or "application/octet-stream"
    finally:
        await file.close()

    uploaded_s3_key = await upload_file_to_s3(filename, content, content_type)
    return UploadFileResponse(s3_key=uploaded_s3_key)
