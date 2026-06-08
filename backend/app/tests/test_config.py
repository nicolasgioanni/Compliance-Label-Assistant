import pytest

from app.config import Settings


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
