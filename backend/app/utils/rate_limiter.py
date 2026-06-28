"""In-memory fixed-window rate limiting helpers."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from math import ceil
from threading import Lock
from time import time


@dataclass(frozen=True)
class RateLimitResult:
    allowed: bool
    limit: int
    remaining: int
    reset_epoch_seconds: int
    retry_after_seconds: int


class FixedWindowRateLimiter:
    """Tracks one process-local fixed-window counter."""

    def __init__(self, now: Callable[[], float] | None = None) -> None:
        self._now = now or time
        self._lock = Lock()
        self._window_started_at = 0.0
        self._used_units = 0

    def consume(self, *, cost: int, limit: int, window_seconds: int) -> RateLimitResult:
        normalized_cost = max(cost, 0)
        normalized_limit = max(limit, 0)
        normalized_window_seconds = max(window_seconds, 1)

        with self._lock:
            current_time = self._now()
            self._reset_expired_window(current_time, normalized_window_seconds)
            reset_at = self._window_started_at + normalized_window_seconds
            retry_after = max(ceil(reset_at - current_time), 0)
            available_units = max(normalized_limit - self._used_units, 0)

            if normalized_cost <= available_units:
                self._used_units += normalized_cost
                remaining = max(normalized_limit - self._used_units, 0)
                return RateLimitResult(
                    allowed=True,
                    limit=normalized_limit,
                    remaining=remaining,
                    reset_epoch_seconds=ceil(reset_at),
                    retry_after_seconds=retry_after,
                )

            return RateLimitResult(
                allowed=False,
                limit=normalized_limit,
                remaining=available_units,
                reset_epoch_seconds=ceil(reset_at),
                retry_after_seconds=retry_after,
            )

    def reset(self) -> None:
        with self._lock:
            self._window_started_at = 0.0
            self._used_units = 0

    def _reset_expired_window(self, current_time: float, window_seconds: int) -> None:
        if self._window_started_at <= 0 or current_time >= self._window_started_at + window_seconds:
            self._window_started_at = current_time
            self._used_units = 0
