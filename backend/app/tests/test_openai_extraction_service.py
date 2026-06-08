from types import SimpleNamespace

import pytest
from openai import OpenAIError

from app.config import Settings
from app.services.openai_extraction_service import (
    ExtractionConfigurationError,
    ExtractionServiceError,
    _extract_label_fields_sync,
)


def test_missing_api_key_raises_configuration_error() -> None:
    settings = Settings(openai_api_key="")

    with pytest.raises(ExtractionConfigurationError, match="OPENAI_API_KEY"):
        _extract_label_fields_sync(b"image bytes", settings)


def test_parse_uses_fast_field_only_responses_parameters(monkeypatch) -> None:
    captured = {}

    class FakeResponses:
        def parse(self, **kwargs):
            captured.update(kwargs)
            return SimpleNamespace(
                output_parsed={
                    "brand_name": "OLD TOM DISTILLERY",
                    "class_type": "Kentucky Straight Bourbon Whiskey",
                    "alcohol_content": "45% Alc./Vol. (90 Proof)",
                    "net_contents": "750 mL",
                    "government_warning_text": "GOVERNMENT WARNING: Standard text.",
                }
            )

    class FakeClient:
        responses = FakeResponses()

    def fake_get_openai_client(settings):
        captured["client_settings"] = settings
        return FakeClient()

    monkeypatch.setattr("app.services.openai_extraction_service.get_openai_client", fake_get_openai_client)

    settings = Settings(
        openai_api_key="test-key",
        openai_model="gpt-test",
    )
    extracted = _extract_label_fields_sync(b"image bytes", settings)

    assert extracted.brand_name == "OLD TOM DISTILLERY"
    assert extracted.raw_text is None
    assert captured["client_settings"] is settings
    assert captured["model"] == "gpt-test"
    assert "max_output_tokens" not in captured
    assert captured["store"] is False
    assert captured["temperature"] == 0
    assert set(captured["text_format"].model_fields) == {
        "brand_name",
        "class_type",
        "alcohol_content",
        "net_contents",
        "government_warning_text",
    }
    image_item = captured["input"][0]["content"][1]
    assert image_item["type"] == "input_image"
    assert "detail" not in image_item
    assert image_item["image_url"].startswith("data:image/jpeg;base64,")


def test_openai_errors_are_mapped_to_safe_user_messages(monkeypatch) -> None:
    class FakeResponses:
        def parse(self, **kwargs):
            raise OpenAIError("provider leaked implementation details")

    class FakeClient:
        responses = FakeResponses()

    monkeypatch.setattr("app.services.openai_extraction_service.get_openai_client", lambda settings: FakeClient())

    with pytest.raises(ExtractionServiceError) as exc_info:
        _extract_label_fields_sync(b"image bytes", Settings(openai_api_key="test-key"))

    assert "provider leaked" not in str(exc_info.value)
    assert str(exc_info.value) == "The extraction service could not process this label. Please try again."
