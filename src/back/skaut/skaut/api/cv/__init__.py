"""CV API module."""

from fastapi import APIRouter

from skaut.api.cv.add import router as add_router
from skaut.api.cv.list import router as list_router
from skaut.api.cv.info import router as info_router
from skaut.api.cv.generate_pdf import router as generate_pdf_router

router = APIRouter(prefix="", tags=["cv"])
router.include_router(add_router)
router.include_router(list_router)
router.include_router(info_router)
router.include_router(generate_pdf_router)


__all__ = ["router"]
