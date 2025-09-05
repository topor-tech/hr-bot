import mimetypes
import os
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException, Response
from fastapi.responses import FileResponse

from skaut.lib.s3 import download_file_from_s3

router = APIRouter(prefix="", tags=["files"])


# Clean up the temporary file after response is sent
def cleanup(temp_file_path: str):
    if os.path.exists(temp_file_path):
        os.unlink(temp_file_path)


@router.get("/api/files/download/{s3_key}")
async def download_file(s3_key: str, background_tasks: BackgroundTasks) -> Any:
    """Download a file from S3 using its UUID (s3_key).
    
    Args:
        s3_key: The UUID key of the file in S3
        
    Returns:
        FileResponse with the downloaded file
    """

    # Download file from S3 to temporary location
    temp_file_path, original_filename = await download_file_from_s3(s3_key)
    
    # Guess media type by file extension
    media_type, _ = mimetypes.guess_type(original_filename)
    if media_type is None:
        media_type = 'application/octet-stream'  # Default fallback
    
    # Schedule cleanup after response
    background_tasks.add_task(cleanup, temp_file_path)
    
    # Return the file as a response
    return FileResponse(
        path=temp_file_path,
        filename=original_filename,
        media_type=media_type
    )

