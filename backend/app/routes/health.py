"""Health check route used by frontend status and deployment smoke checks."""

from fastapi import APIRouter

from app.config import get_settings

router = APIRouter()


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Return the stable health payload consumed by browser status UI."""
    settings = get_settings()
    return {"status": "ok", "service": settings.service_name}

