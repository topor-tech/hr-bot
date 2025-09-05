from fastapi import APIRouter

from skaut.api.files.upload import router as upload_router


router = APIRouter(prefix="", tags=["files"])
router.include_router(upload_router)
