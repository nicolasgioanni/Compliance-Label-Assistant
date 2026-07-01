"""Small timing helpers used by services and response builders.

Timing metrics are part of the response contract for reviewer feedback and
performance smoke checks, so services share one millisecond conversion path.
"""

from time import perf_counter


def start_timer() -> float:
    """Start a monotonic timer for one processing phase."""
    return perf_counter()


def get_elapsed_ms(start_time: float) -> int:
    """Convert elapsed monotonic time into integer milliseconds."""
    return int((perf_counter() - start_time) * 1000)

