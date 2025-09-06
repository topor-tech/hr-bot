from fastapi import APIRouter
from .add import router as add_router
from .list import router as list_router
from .info import router as info_router
from .genarate_pdf import router as generate_pdf_router
from .extract import router as extract_router

router = APIRouter(prefix="", tags=["jobs"])
router.include_router(add_router)
router.include_router(list_router)
router.include_router(info_router)
router.include_router(generate_pdf_router)
router.include_router(extract_router)

__all__ = ["router"]
