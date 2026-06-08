"""Warmup route for lazy verification dependencies."""

from fastapi import APIRouter

from app.services.warmup_service import warm_verification_dependencies

router = APIRouter()


@router.post("/warmup")
async def warmup() -> dict[str, str]:
    warm_verification_dependencies()
    return {"status": "ok"}
