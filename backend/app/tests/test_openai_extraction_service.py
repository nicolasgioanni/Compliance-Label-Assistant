from types import SimpleNamespace

import pytest

from app.config import Settings
from app.schemas import ExtractedFields
from app.services import openai_extraction_service
from app.services.openai_extraction_service import (
    ExtractionConfigurationError,
    _extract_label_fields_sync,
)


def test_missing_api_key_raises_configuration_error() -> None:
    settings = Settings(openai_api_key="")

    with pytest.raises(ExtractionConfigurationError, match="OPENAI_API_KEY"):
        _extract_label_fields_sync(b"image bytes", settings)


def test_parse_uses_pydantic_text_format(monkeypatch) -> None:
    captured = {}

    class FakeResponses:
        def parse(self, **kwargs):
            captured.update(kwargs)
            return SimpleNamespace(
                output_parsed=ExtractedFields(
                    brand_name="OLD TOM DISTILLERY",
                    class_type="Kentucky Straight Bourbon Whiskey",
                    alcohol_content="45% Alc./Vol. (90 Proof)",
                    net_contents="750 mL",
                    government_warning_text="GOVERNMENT WARNING: Standard text.",
                    raw_text="OLD TOM DISTILLERY",
                )
            )

    class FakeClient:
        responses = FakeResponses()

    def fake_openai(**kwargs):
        captured["client_kwargs"] = kwargs
        return FakeClient()

    monkeypatch.setattr(openai_extraction_service, "OpenAI", fake_openai)

    settings = Settings(openai_api_key="test-key", openai_model="gpt-test", openai_timeout_seconds=7)
    extracted = _extract_label_fields_sync(b"image bytes", settings)

    assert extracted.brand_name == "OLD TOM DISTILLERY"
    assert captured["client_kwargs"] == {"api_key": "test-key", "timeout": 7}
    assert captured["model"] == "gpt-test"
    assert captured["text_format"] is ExtractedFields
    image_item = captured["input"][0]["content"][1]
    assert image_item["type"] == "input_image"
    assert image_item["image_url"].startswith("data:image/jpeg;base64,")

