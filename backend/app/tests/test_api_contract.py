from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from app.config import Settings
from app.main import app
from app.schemas import ExtractedFields
from app.services import single_verification_service


client = TestClient(app)


def _image_bytes(image_format: str = "PNG") -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (24, 24), color="white").save(buffer, format=image_format)
    return buffer.getvalue()


def test_health_contract() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "alcohol-label-verification-api",
    }


STANDARD_WARNING = (
    "GOVERNMENT WARNING: According to the Surgeon General, women should not drink alcoholic beverages during "
    "pregnancy because of the risk of birth defects. Consumption of alcoholic beverages impairs your ability "
    "to drive a car or operate machinery, and may cause health problems."
)


def _expected_form_data(**overrides: str) -> dict[str, str]:
    form_data = {
        "brand_name": "OLD TOM DISTILLERY",
        "class_type": "Kentucky Straight Bourbon Whiskey",
        "alcohol_content": "45% Alc./Vol. (90 Proof)",
        "net_contents": "750 mL",
        "government_warning": STANDARD_WARNING,
    }
    form_data.update(overrides)
    return form_data


def _post_verify_with_extracted(monkeypatch, extracted_fields: ExtractedFields):
    async def fake_extract_label_fields(image_bytes: bytes, settings):
        assert image_bytes
        assert settings.openai_model
        return extracted_fields

    monkeypatch.setattr(single_verification_service, "extract_label_fields", fake_extract_label_fields)

    return client.post(
        "/verify",
        data=_expected_form_data(),
        files={"file": ("old-tom.png", _image_bytes(), "image/png")},
    )


def test_verify_extraction_backed_contract(monkeypatch) -> None:
    response = _post_verify_with_extracted(
        monkeypatch,
        ExtractedFields(
            brand_name="OLD TOM DISTILLERY",
            class_type="Kentucky Straight Bourbon Whiskey",
            alcohol_content="90 Proof",
            net_contents="0.75 L",
            government_warning_text=STANDARD_WARNING,
            raw_text="OLD TOM DISTILLERY\nKentucky Straight Bourbon Whiskey\n750 mL",
        ),
    )

    body = response.json()

    assert response.status_code == 200
    assert body["filename"] == "old-tom.png"
    assert body["overall_status"] == "pass"
    assert body["extraction_time_ms"] >= 1
    assert [field["status"] for field in body["field_results"]] == ["pass", "pass", "pass", "pass", "pass"]
    assert body["message"].startswith("AI extraction completed and deterministic")


def test_verify_returns_fail_when_extracted_value_conflicts(monkeypatch) -> None:
    response = _post_verify_with_extracted(
        monkeypatch,
        ExtractedFields(
            brand_name="NEW TOM DISTILLERY",
            class_type="Kentucky Straight Bourbon Whiskey",
            alcohol_content="90 Proof",
            net_contents="750 mL",
            government_warning_text=STANDARD_WARNING,
            raw_text="NEW TOM DISTILLERY",
        ),
    )

    body = response.json()

    assert response.status_code == 200
    assert body["overall_status"] == "fail"
    assert body["field_results"][0]["status"] == "fail"


def test_verify_returns_needs_review_when_field_missing(monkeypatch) -> None:
    response = _post_verify_with_extracted(
        monkeypatch,
        ExtractedFields(
            brand_name=None,
            class_type="Kentucky Straight Bourbon Whiskey",
            alcohol_content="90 Proof",
            net_contents="750 mL",
            government_warning_text=STANDARD_WARNING,
            raw_text="Kentucky Straight Bourbon Whiskey",
        ),
    )

    body = response.json()

    assert response.status_code == 200
    assert body["overall_status"] == "needs_review"
    assert body["field_results"][0]["status"] == "missing"


def test_verify_returns_needs_review_for_similar_brand(monkeypatch) -> None:
    response = _post_verify_with_extracted(
        monkeypatch,
        ExtractedFields(
            brand_name="OLD TOM DISTILLERIES",
            class_type="Kentucky Straight Bourbon Whiskey",
            alcohol_content="90 Proof",
            net_contents="750 mL",
            government_warning_text=STANDARD_WARNING,
            raw_text="OLD TOM DISTILLERIES",
        ),
    )

    body = response.json()

    assert response.status_code == 200
    assert body["overall_status"] == "needs_review"
    assert body["field_results"][0]["status"] == "needs_review"


def test_verify_rejects_invalid_file_before_extraction(monkeypatch) -> None:
    async def fail_if_called(image_bytes: bytes, settings):
        raise AssertionError("Extraction should not run for invalid uploads.")

    monkeypatch.setattr(single_verification_service, "extract_label_fields", fail_if_called)

    response = client.post(
        "/verify",
        data={
            "brand_name": "OLD TOM DISTILLERY",
            "class_type": "Kentucky Straight Bourbon Whiskey",
            "alcohol_content": "45% Alc./Vol. (90 Proof)",
            "net_contents": "750 mL",
            "government_warning": STANDARD_WARNING,
        },
        files={"file": ("bad.svg", b"<svg />", "image/svg+xml")},
    )

    assert response.status_code == 400
    assert "Unsupported file extension" in response.json()["detail"]


def test_verify_missing_api_key_returns_setup_error(monkeypatch) -> None:
    monkeypatch.setattr(single_verification_service, "get_settings", lambda: Settings(openai_api_key=""))

    response = client.post(
        "/verify",
        data={
            "brand_name": "OLD TOM DISTILLERY",
            "class_type": "Kentucky Straight Bourbon Whiskey",
            "alcohol_content": "45% Alc./Vol. (90 Proof)",
            "net_contents": "750 mL",
            "government_warning": STANDARD_WARNING,
        },
        files={"file": ("old-tom.png", _image_bytes(), "image/png")},
    )

    assert response.status_code == 503
    assert "OPENAI_API_KEY" in response.json()["detail"]
