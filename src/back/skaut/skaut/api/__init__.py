from fastapi import APIRouter

from skaut.api.preprocess import router as preprocess_router
from skaut.api.files import router as files_router
from skaut.api.cv import router as cv_router


router = APIRouter(prefix="", tags=["api"])
router.include_router(preprocess_router)
router.include_router(files_router)
router.include_router(cv_router)
