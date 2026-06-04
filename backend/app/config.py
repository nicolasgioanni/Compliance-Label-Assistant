"""Centralized application configuration.

Routes and services import settings from this module instead of reading
environment variables directly. This keeps deployment behavior predictable and
prevents accidental frontend exposure of backend-only values.
"""

from __future__ import annotations

from dataclasses import dataclass
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


def _read_origins() -> list[str]:
    raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


@dataclass(frozen=True)
class Settings:
    service_name: str = "alcohol-label-verification-api"
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
    max_file_size_mb: int = _read_int("MAX_FILE_SIZE_MB", 5)
    max_batch_size: int = _read_int("MAX_BATCH_SIZE", 10)
    max_image_width: int = _read_int("MAX_IMAGE_WIDTH", 1600)
    allowed_origins: list[str] | None = None

    def __post_init__(self) -> None:
        if self.allowed_origins is None:
            object.__setattr__(self, "allowed_origins", _read_origins())


@lru_cache
def get_settings() -> Settings:
    return Settings()

