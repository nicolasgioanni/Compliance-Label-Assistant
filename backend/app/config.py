"""Centralized application configuration.

Routes and services import settings from this module instead of reading
environment variables directly. This keeps deployment behavior predictable and
prevents accidental frontend exposure of backend-only values.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from functools import lru_cache
import os


def _read_int(name: str, default: int) -> int:
    raw_value = os.getenv(name)
    if raw_value is None or raw_value == "":
        return default
    try:
        return int(raw_value)
    except ValueError:
        return default


def _read_bounded_int(name: str, default: int, minimum: int, maximum: int) -> int:
    return min(max(_read_int(name, default), minimum), maximum)


def _read_choice(name: str, default: str, allowed_values: set[str]) -> str:
    raw_value = os.getenv(name, default).strip().lower()
    if raw_value in allowed_values:
        return raw_value
    return default


def _read_bool(name: str, default: bool) -> bool:
    raw_value = os.getenv(name)
    if raw_value is None or raw_value == "":
        return default

    normalized_value = raw_value.strip().lower()
    if normalized_value in {"1", "true", "yes", "on"}:
        return True
    if normalized_value in {"0", "false", "no", "off"}:
        return False
    return default


def _read_origins() -> list[str]:
    raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


@dataclass(frozen=True)
class Settings:
    service_name: str = "alcohol-label-verification-api"
    openai_api_key: str = field(default_factory=lambda: os.getenv("OPENAI_API_KEY", ""))
    openai_model: str = field(default_factory=lambda: os.getenv("OPENAI_MODEL", "gpt-4.1-mini"))
    openai_timeout_seconds: int = field(default_factory=lambda: _read_bounded_int("OPENAI_TIMEOUT_SECONDS", 10, 2, 30))
    openai_image_detail: str = field(
        default_factory=lambda: _read_choice("OPENAI_IMAGE_DETAIL", "low", {"low", "auto", "high"})
    )
    openai_max_retries: int = field(default_factory=lambda: _read_bounded_int("OPENAI_MAX_RETRIES", 0, 0, 2))
    openai_extraction_concurrency: int = field(
        default_factory=lambda: _read_bounded_int("OPENAI_EXTRACTION_CONCURRENCY", 2, 1, 4)
    )
    openai_network_warmup: bool = field(default_factory=lambda: _read_bool("OPENAI_NETWORK_WARMUP", True))
    openai_warmup_timeout_seconds: int = field(
        default_factory=lambda: _read_bounded_int("OPENAI_WARMUP_TIMEOUT_SECONDS", 2, 1, 5)
    )
    max_file_size_mb: int = field(default_factory=lambda: _read_int("MAX_FILE_SIZE_MB", 5))
    max_image_pixels: int = field(default_factory=lambda: _read_int("MAX_IMAGE_PIXELS", 25_000_000))
    max_batch_size: int = field(default_factory=lambda: _read_int("MAX_BATCH_SIZE", 10))
    batch_concurrency: int = field(default_factory=lambda: _read_int("BATCH_CONCURRENCY", 3))
    max_image_width: int = field(default_factory=lambda: _read_bounded_int("MAX_IMAGE_WIDTH", 640, 600, 2000))
    jpeg_quality: int = field(default_factory=lambda: _read_bounded_int("JPEG_QUALITY", 60, 50, 95))
    allowed_origins: list[str] = field(default_factory=_read_origins)


@lru_cache
def get_settings() -> Settings:
    return Settings()
