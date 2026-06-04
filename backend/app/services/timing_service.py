"""Small timing helpers used by services and response builders."""

from time import perf_counter


def start_timer() -> float:
    return perf_counter()


def get_elapsed_ms(start_time: float) -> int:
    return int((perf_counter() - start_time) * 1000)

