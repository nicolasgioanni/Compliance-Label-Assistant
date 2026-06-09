import pytest

from app.config import Settings


def test_speed_and_cost_sensitive_defaults(monkeypatch) -> None:
    env_vars = [
        "OPENAI_MODEL",
        "OPENAI_TIMEOUT_SECONDS",
        "OPENAI_IMAGE_DETAIL",
        "OPENAI_MAX_RETRIES",
        "OPENAI_EXTRACTION_CONCURRENCY",
        "OPENAI_NETWORK_WARMUP",
        "OPENAI_WARMUP_TIMEOUT_SECONDS",
        "MAX_FILE_SIZE_MB",
        "MAX_IMAGE_PIXELS",
        "MAX_BATCH_SIZE",
        "BATCH_CONCURRENCY",
        "MAX_IMAGE_WIDTH",
        "JPEG_QUALITY",
        "ALLOWED_ORIGINS",
    ]
    for name in env_vars:
        monkeypatch.delenv(name, raising=False)

    settings = Settings()

    assert settings.openai_model == "gpt-4.1-mini"
    assert settings.openai_timeout_seconds == 10
    assert settings.openai_image_detail == "low"
    assert settings.openai_max_retries == 0
    assert settings.openai_extraction_concurrency == 2
    assert settings.openai_network_warmup is True
    assert settings.openai_warmup_timeout_seconds == 2
    assert settings.max_file_size_mb == 5
    assert settings.max_image_pixels == 25_000_000
    assert settings.max_batch_size == 10
    assert settings.batch_concurrency == 3
    assert settings.max_image_width == 640
    assert settings.jpeg_quality == 60
    assert settings.allowed_origins == ["http://localhost:5173"]


def test_openai_image_detail_defaults_to_low(monkeypatch) -> None:
    monkeypatch.delenv("OPENAI_IMAGE_DETAIL", raising=False)

    assert Settings().openai_image_detail == "low"


@pytest.mark.parametrize("detail", ["low", "auto", "high"])
def test_openai_image_detail_allows_supported_values(monkeypatch, detail: str) -> None:
    monkeypatch.setenv("OPENAI_IMAGE_DETAIL", detail)

    assert Settings().openai_image_detail == detail


def test_openai_image_detail_falls_back_to_low_for_invalid_values(monkeypatch) -> None:
    monkeypatch.setenv("OPENAI_IMAGE_DETAIL", "original")

    assert Settings().openai_image_detail == "low"


@pytest.mark.parametrize(
    ("raw_value", "expected"),
    [
        ("true", True),
        ("1", True),
        ("yes", True),
        ("on", True),
        ("false", False),
        ("0", False),
        ("no", False),
        ("off", False),
    ],
)
def test_openai_network_warmup_parses_common_boolean_values(monkeypatch, raw_value: str, expected: bool) -> None:
    monkeypatch.setenv("OPENAI_NETWORK_WARMUP", raw_value)

    assert Settings().openai_network_warmup is expected


def test_openai_network_warmup_defaults_to_true_for_invalid_values(monkeypatch) -> None:
    monkeypatch.setenv("OPENAI_NETWORK_WARMUP", "maybe")

    assert Settings().openai_network_warmup is True


@pytest.mark.parametrize(
    ("raw_value", "expected"),
    [
        ("0", 1),
        ("1", 1),
        ("2", 2),
        ("5", 5),
        ("10", 5),
        ("not-a-number", 2),
    ],
)
def test_openai_warmup_timeout_is_bounded(monkeypatch, raw_value: str, expected: int) -> None:
    monkeypatch.setenv("OPENAI_WARMUP_TIMEOUT_SECONDS", raw_value)

    assert Settings().openai_warmup_timeout_seconds == expected
