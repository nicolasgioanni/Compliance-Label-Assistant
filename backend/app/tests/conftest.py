"""Shared pytest fixtures for backend contract isolation."""

import pytest

from app.services.rate_limit_service import reset_verification_rate_limiter


@pytest.fixture(autouse=True)
def reset_process_rate_limiter():
    """Keep process-local verification limits from leaking across tests."""
    reset_verification_rate_limiter()
    yield
    reset_verification_rate_limiter()
