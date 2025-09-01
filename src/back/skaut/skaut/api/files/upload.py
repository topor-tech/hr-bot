import base64
import uuid
from typing import Any, Dict

import aioboto3  # type: ignore[import]
from fastapi import APIRouter, File, HTTPException, UploadFile

from skaut.config import settings


router = APIRouter(prefix="/files", tags=["files"])


@router.post("/api/files/upload")
async def upload_file(file: UploadFile = File(...)) -> Dict[str, Any]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    try:
        # Generate UUID5 key based on original filename
        namespace = uuid.NAMESPACE_URL
        file_key = str(uuid.uuid5(namespace, file.filename))
        
        # Encode original filename to base64 for S3 metadata (S3 only supports ASCII)
        encoded_filename = base64.b64encode(file.filename.encode('utf-8')).decode('ascii')
        
        # Read file content
        content = await file.read()

        # Upload to S3 using async client
        session = aioboto3.Session()
        async with session.client(
            "s3",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        ) as s3_client:
            await s3_client.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=file_key,
                Body=content,
                ContentType=file.content_type or "application/octet-stream",
                Metadata={
                    "original-filename-b64": encoded_filename,
                },
            )

        url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{file_key}"
        return {
            "key": file_key,
            "original_filename": file.filename,
            "bucket": settings.S3_BUCKET_NAME,
            "url": url,
        }
    except Exception as exc:  # pragma: no cover - bubble up as 500
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {exc}") from exc
    finally:
        await file.close()


