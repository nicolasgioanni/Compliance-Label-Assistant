"""Small OpenAI client factory with bounded client reuse."""

from __future__ import annotations

from functools import lru_cache

from openai import OpenAI

from app.config import Settings


def get_openai_client(settings: Settings) -> OpenAI:
    return _get_cached_openai_client(
        api_key=settings.openai_api_key,
        timeout_seconds=settings.openai_timeout_seconds,
        max_retries=settings.openai_max_retries,
    )


@lru_cache
def _get_cached_openai_client(api_key: str, timeout_seconds: int, max_retries: int) -> OpenAI:
    return OpenAI(api_key=api_key, timeout=timeout_seconds, max_retries=max_retries)


def clear_openai_client_cache() -> None:
    """Clear cached clients for tests that monkeypatch the OpenAI constructor."""

    _get_cached_openai_client.cache_clear()
