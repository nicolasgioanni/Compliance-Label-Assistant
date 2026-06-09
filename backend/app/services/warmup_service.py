"""Best-effort warmup for verification dependencies."""

from app.config import Settings, get_settings
from app.providers.openai.client import get_openai_client


def warm_verification_dependencies(settings: Settings | None = None) -> None:
    """Initialize reusable clients and optionally warm the provider network path."""

    active_settings = settings or get_settings()
    if not active_settings.openai_api_key:
        return

    try:
        client = get_openai_client(active_settings)
        if active_settings.openai_network_warmup:
            client.models.retrieve(
                active_settings.openai_model,
                timeout=active_settings.openai_warmup_timeout_seconds,
            )
    except Exception:
        return
