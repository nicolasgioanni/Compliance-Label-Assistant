import pytest

from app.services.rate_limit_service import reset_verification_rate_limiter


@pytest.fixture(autouse=True)
def reset_process_rate_limiter():
    reset_verification_rate_limiter()
    yield
    reset_verification_rate_limiter()
