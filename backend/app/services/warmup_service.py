"""Best-effort warmup for verification dependencies."""

from threading import Lock

from app.config import Settings, get_settings
from app.providers.openai.client import get_openai_client


_WARMED_NETWORK_MODELS: set[str] = set()
_WARMUP_LOCK = Lock()


def warm_verification_dependencies(settings: Settings | None = None) -> None:
    """Initialize reusable clients and optionally warm the provider network path."""

    active_settings = settings or get_settings()
    if not active_settings.openai_api_key:
        return

    try:
        # Warmup is best-effort and intentionally does not send image bytes,
        # expected fields, or extraction prompts.
        client = get_openai_client(active_settings)
        if active_settings.openai_network_warmup and _should_run_network_warmup(active_settings.openai_model):
            client.models.retrieve(
                active_settings.openai_model,
                timeout=active_settings.openai_warmup_timeout_seconds,
            )
    except Exception:
        return


def clear_warmup_network_cache() -> None:
    """Clear warmed-model state for tests that exercise warmup behavior."""
    with _WARMUP_LOCK:
        _WARMED_NETWORK_MODELS.clear()


def _should_run_network_warmup(model: str) -> bool:
    """Allow one provider network warmup per model per process."""
    with _WARMUP_LOCK:
        if model in _WARMED_NETWORK_MODELS:
            return False

        _WARMED_NETWORK_MODELS.add(model)
        return True
