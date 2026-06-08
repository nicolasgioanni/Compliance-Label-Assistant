"""Best-effort warmup for verification dependencies."""

from app.config import Settings, get_settings
from app.providers.openai.client import get_openai_client


def warm_verification_dependencies(settings: Settings | None = None) -> None:
    """Initialize reusable clients without making model requests."""

    active_settings = settings or get_settings()
    if not active_settings.openai_api_key:
        return

    try:
        get_openai_client(active_settings)
    except Exception:
        return
