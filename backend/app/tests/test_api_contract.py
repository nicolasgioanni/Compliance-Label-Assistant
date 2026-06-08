from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from app.config import Settings
from app.main import app
from app.routes import verification
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


def _post_verify_batch_with_extracted(monkeypatch, extracted_fields: ExtractedFields, files):
    async def fake_extract_label_fields(image_bytes: bytes, settings):
        assert image_bytes
        assert settings.openai_model
        return extracted_fields

    monkeypatch.setattr(single_verification_service, "extract_label_fields", fake_extract_label_fields)

    return client.post(
        "/verify-batch",
        data=_expected_form_data(),
        files=files,
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


def test_verify_rejects_pixel_overflow_before_extraction(monkeypatch) -> None:
    async def fail_if_called(image_bytes: bytes, settings):
        raise AssertionError("Extraction should not run for invalid uploads.")

    monkeypatch.setattr(single_verification_service, "extract_label_fields", fail_if_called)
    monkeypatch.setattr(
        single_verification_service,
        "get_settings",
        lambda: Settings(openai_api_key="test-key", max_image_pixels=399),
    )

    response = client.post(
        "/verify",
        data=_expected_form_data(),
        files={"file": ("old-tom.png", _image_bytes(), "image/png")},
    )

    assert response.status_code == 400
    assert "Image dimensions too large" in response.json()["detail"]


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


def test_unexpected_verify_error_returns_safe_json(monkeypatch) -> None:
    safe_client = TestClient(app, raise_server_exceptions=False)

    async def fail_unexpectedly(file, expected_fields):
        raise RuntimeError("internal stack detail should not be returned")

    monkeypatch.setattr(verification, "verify_single_label", fail_unexpectedly)

    response = safe_client.post(
        "/verify",
        data=_expected_form_data(),
        files={"file": ("old-tom.png", _image_bytes(), "image/png")},
    )

    body = response.json()

    assert response.status_code == 500
    assert body == {"detail": "An unexpected server error occurred. Please try again."}
    assert "internal stack detail" not in str(body)


def test_verify_batch_rejects_too_few_files(monkeypatch) -> None:
    response = _post_verify_batch_with_extracted(
        monkeypatch,
        ExtractedFields(),
        [("files", ("old-tom.png", _image_bytes(), "image/png"))],
    )

    assert response.status_code == 400
    assert "at least 2" in response.json()["detail"]


def test_verify_batch_rejects_too_many_files(monkeypatch) -> None:
    files = [
        ("files", (f"old-tom-{index}.png", _image_bytes(), "image/png"))
        for index in range(11)
    ]

    response = _post_verify_batch_with_extracted(monkeypatch, ExtractedFields(), files)

    assert response.status_code == 400
    assert "Batch size limit exceeded" in response.json()["detail"]


def test_verify_batch_rejects_duplicate_filenames(monkeypatch) -> None:
    response = _post_verify_batch_with_extracted(
        monkeypatch,
        ExtractedFields(),
        [
            ("files", ("old-tom.png", _image_bytes(), "image/png")),
            ("files", ("Old-Tom.PNG", _image_bytes(), "image/png")),
        ],
    )

    assert response.status_code == 400
    assert "1 duplicate file was detected and not uploaded." in response.json()["detail"]


def test_verify_batch_rejects_path_prefixed_duplicate_filenames(monkeypatch) -> None:
    response = _post_verify_batch_with_extracted(
        monkeypatch,
        ExtractedFields(),
        [
            ("files", ("old-tom.png", _image_bytes(), "image/png")),
            ("files", ("images/old-tom.png", _image_bytes(), "image/png")),
        ],
    )

    assert response.status_code == 400
    assert "1 duplicate file was detected and not uploaded." in response.json()["detail"]


def test_verify_batch_rejects_windows_path_prefixed_duplicate_filenames(monkeypatch) -> None:
    response = _post_verify_batch_with_extracted(
        monkeypatch,
        ExtractedFields(),
        [
            ("files", ("old-tom.png", _image_bytes(), "image/png")),
            ("files", ("folder\\old-tom.png", _image_bytes(), "image/png")),
        ],
    )

    assert response.status_code == 400
    assert "1 duplicate file was detected and not uploaded." in response.json()["detail"]


def test_verify_batch_reports_multiple_duplicate_filename_count(monkeypatch) -> None:
    response = _post_verify_batch_with_extracted(
        monkeypatch,
        ExtractedFields(),
        [
            ("files", ("old-tom.png", _image_bytes(), "image/png")),
            ("files", ("Old-Tom.PNG", _image_bytes(), "image/png")),
            ("files", ("images/old-tom.png", _image_bytes(), "image/png")),
            ("files", ("front-label.png", _image_bytes(), "image/png")),
            ("files", ("folder\\front-label.png", _image_bytes(), "image/png")),
        ],
    )

    assert response.status_code == 400
    assert "3 duplicate files were detected and not uploaded." in response.json()["detail"]


def test_verify_batch_returns_one_result_per_valid_file(monkeypatch) -> None:
    response = _post_verify_batch_with_extracted(
        monkeypatch,
        ExtractedFields(
            brand_name="OLD TOM DISTILLERY",
            class_type="Kentucky Straight Bourbon Whiskey",
            alcohol_content="90 Proof",
            net_contents="750 mL",
            government_warning_text=STANDARD_WARNING,
            raw_text="OLD TOM DISTILLERY",
        ),
        [
            ("files", ("old-tom-a.png", _image_bytes(), "image/png")),
            ("files", ("old-tom-b.jpg", _image_bytes("JPEG"), "image/jpeg")),
        ],
    )

    body = response.json()

    assert response.status_code == 200
    assert body["mode"] == "batch"
    assert body["total_labels"] == 2
    assert body["completed"] == 2
    assert body["status_counts"] == {"pass": 2, "fail": 0, "needs_review": 0, "error": 0}
    assert len(body["results"]) == 2
    assert body["results"][0]["filename"] == "old-tom-a.png"
    assert "expected_fields" in body["results"][0]
    assert "extracted_fields" in body["results"][0]
    assert "field_results" in body["results"][0]


def test_verify_batch_returns_partial_per_file_errors(monkeypatch) -> None:
    response = _post_verify_batch_with_extracted(
        monkeypatch,
        ExtractedFields(
            brand_name="OLD TOM DISTILLERY",
            class_type="Kentucky Straight Bourbon Whiskey",
            alcohol_content="90 Proof",
            net_contents="750 mL",
            government_warning_text=STANDARD_WARNING,
            raw_text="OLD TOM DISTILLERY",
        ),
        [
            ("files", ("old-tom.png", _image_bytes(), "image/png")),
            ("files", ("bad.svg", b"<svg />", "image/svg+xml")),
        ],
    )

    body = response.json()

    assert response.status_code == 200
    assert body["total_labels"] == 2
    assert body["completed"] == 1
    assert body["status_counts"] == {"pass": 1, "fail": 0, "needs_review": 0, "error": 1}
    assert [result["overall_status"] for result in body["results"]] == ["pass", "error"]
    assert "Unsupported file extension" in body["results"][1]["error"]
