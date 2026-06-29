"""Warmup route for lazy verification dependencies.

The route is intentionally tiny: it triggers best-effort provider/client warmup
without requiring upload data, expected fields, or a response beyond the stable
public status shape.
"""

from fastapi import APIRouter

from app.services.warmup_service import warm_verification_dependencies

router = APIRouter()


@router.post("/warmup")
async def warmup() -> dict[str, str]:
    """Initialize reusable dependencies while preserving a safe response."""
    warm_verification_dependencies()
    return {"status": "ok"}
