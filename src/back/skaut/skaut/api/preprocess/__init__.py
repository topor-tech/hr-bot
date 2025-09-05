from fastapi import APIRouter

from skaut.api.preprocess.extract_cv import router as preprocess_router
from skaut.api.preprocess.convet_to_pdf import router as convert_to_pdf_router


router = APIRouter(prefix="", tags=["preprocess"])
router.include_router(preprocess_router)
router.include_router(convert_to_pdf_router)

