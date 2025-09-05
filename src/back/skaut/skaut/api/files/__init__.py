from fastapi import APIRouter

from skaut.api.files.upload import router as upload_router
from skaut.api.files.download import router as download_router


router = APIRouter(prefix="", tags=["files"])
router.include_router(upload_router)
router.include_router(download_router)
