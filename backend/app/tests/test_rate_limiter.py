from app.utils.rate_limiter import FixedWindowRateLimiter


def test_fixed_window_rate_limiter_allows_requests_under_limit() -> None:
    limiter = FixedWindowRateLimiter(now=lambda: 1_000)

    result = limiter.consume(cost=25, limit=50, window_seconds=86_400)

    assert result.allowed is True
    assert result.limit == 50
    assert result.remaining == 25


def test_fixed_window_rate_limiter_blocks_when_cost_exceeds_remaining_units() -> None:
    limiter = FixedWindowRateLimiter(now=lambda: 1_000)

    first_result = limiter.consume(cost=50, limit=50, window_seconds=86_400)
    blocked_result = limiter.consume(cost=1, limit=50, window_seconds=86_400)

    assert first_result.allowed is True
    assert blocked_result.allowed is False
    assert blocked_result.remaining == 0


def test_fixed_window_rate_limiter_resets_after_window() -> None:
    current_time = 1_000
    limiter = FixedWindowRateLimiter(now=lambda: current_time)

    limiter.consume(cost=50, limit=50, window_seconds=60)
    current_time = 1_061
    result = limiter.consume(cost=1, limit=50, window_seconds=60)

    assert result.allowed is True
    assert result.remaining == 49
