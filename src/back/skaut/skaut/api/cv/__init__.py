"""CV API module."""

from fastapi import APIRouter

from skaut.api.cv.add import router as add_router


router = APIRouter(prefix="", tags=["cv"])
router.include_router(add_router)


__all__ = ["router"]
