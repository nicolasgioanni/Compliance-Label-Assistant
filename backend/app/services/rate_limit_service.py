"""Verification rate-limit orchestration."""

from __future__ import annotations

from app.config import Settings, get_settings
from app.utils.rate_limiter import FixedWindowRateLimiter, RateLimitResult


DAILY_VERIFICATION_LIMIT_MESSAGE = "Daily verification limit reached. Please try again when the limit resets."

_VERIFICATION_RATE_LIMITER = FixedWindowRateLimiter()


class VerificationRateLimitError(RuntimeError):
    """Raised when the verification unit budget is exhausted."""

    def __init__(self, result: RateLimitResult) -> None:
        super().__init__(DAILY_VERIFICATION_LIMIT_MESSAGE)
        self.result = result


def reserve_verification_units(unit_cost: int, settings: Settings | None = None) -> RateLimitResult | None:
    active_settings = settings or get_settings()
    if not active_settings.verification_rate_limit_enabled:
        return None

    result = _VERIFICATION_RATE_LIMITER.consume(
        cost=unit_cost,
        limit=active_settings.verification_daily_unit_limit,
        window_seconds=active_settings.verification_rate_limit_window_seconds,
    )
    if not result.allowed:
        raise VerificationRateLimitError(result)
    return result


def build_rate_limit_headers(result: RateLimitResult) -> dict[str, str]:
    return {
        "Retry-After": str(result.retry_after_seconds),
        "X-RateLimit-Limit": str(result.limit),
        "X-RateLimit-Remaining": str(result.remaining),
        "X-RateLimit-Reset": str(result.reset_epoch_seconds),
    }


def reset_verification_rate_limiter() -> None:
    _VERIFICATION_RATE_LIMITER.reset()
