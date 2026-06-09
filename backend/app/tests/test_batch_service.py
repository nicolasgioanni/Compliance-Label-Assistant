import asyncio
from io import BytesIO

from fastapi import UploadFile
from starlette.datastructures import Headers

from app.config import Settings
from app.image_processing.validation import UploadValidationError
from app.schemas import ExpectedFields, ExtractedFields, SingleVerificationResponse
from app.services import batch_service


EXPECTED_FIELDS = ExpectedFields(
    brand_name="OLD TOM DISTILLERY",
    class_type="Kentucky Straight Bourbon Whiskey",
    alcohol_content="45% Alc./Vol. (90 Proof)",
    net_contents="750 mL",
    government_warning="GOVERNMENT WARNING: standard text",
)


def _upload_file(filename: str) -> UploadFile:
    return UploadFile(
        filename=filename,
        file=BytesIO(b"image-bytes"),
        headers=Headers({"content-type": "image/png"}),
    )


def _single_response(filename: str, status: str = "pass") -> SingleVerificationResponse:
    return SingleVerificationResponse(
        filename=filename,
        overall_status=status,
        expected_fields=EXPECTED_FIELDS,
        extracted_fields=ExtractedFields(brand_name="OLD TOM DISTILLERY"),
        field_results=[],
        processing_time_ms=5,
        extraction_time_ms=3,
        verification_time_ms=1,
    )


def test_validate_batch_request_rejects_too_few_files() -> None:
    try:
        batch_service.validate_batch_request(1, 10)
    except batch_service.BatchRequestValidationError as exc:
        assert "at least 2" in str(exc)
    else:
        raise AssertionError("Expected too-few-files validation error.")


def test_validate_batch_request_rejects_too_many_files() -> None:
    try:
        batch_service.validate_batch_request(11, 10)
    except batch_service.BatchRequestValidationError as exc:
        assert "Batch size limit exceeded" in str(exc)
    else:
        raise AssertionError("Expected too-many-files validation error.")


def test_validate_batch_filenames_rejects_duplicates() -> None:
    try:
        batch_service.validate_batch_filenames([_upload_file("label.png"), _upload_file("Label.PNG")])
    except batch_service.BatchRequestValidationError as exc:
        assert "1 duplicate file was detected and not uploaded." in str(exc)
    else:
        raise AssertionError("Expected duplicate filename validation error.")


def test_validate_batch_filenames_rejects_path_prefixed_duplicates() -> None:
    try:
        batch_service.validate_batch_filenames([_upload_file("label.png"), _upload_file("images/label.png")])
    except batch_service.BatchRequestValidationError as exc:
        assert "1 duplicate file was detected and not uploaded." in str(exc)
    else:
        raise AssertionError("Expected duplicate filename validation error.")


def test_validate_batch_filenames_rejects_windows_path_prefixed_duplicates() -> None:
    try:
        batch_service.validate_batch_filenames([_upload_file("label.png"), _upload_file("folder\\label.png")])
    except batch_service.BatchRequestValidationError as exc:
        assert "1 duplicate file was detected and not uploaded." in str(exc)
    else:
        raise AssertionError("Expected duplicate filename validation error.")


def test_validate_batch_filenames_counts_multiple_duplicate_repeats() -> None:
    try:
        batch_service.validate_batch_filenames(
            [
                _upload_file("label.png"),
                _upload_file("Label.PNG"),
                _upload_file("images/label.png"),
                _upload_file("other.png"),
                _upload_file("nested/other.png"),
            ]
        )
    except batch_service.BatchRequestValidationError as exc:
        assert "3 duplicate files were detected and not uploaded." in str(exc)
    else:
        raise AssertionError("Expected duplicate filename validation error.")


async def _run_partial_failure_test(monkeypatch) -> None:
    async def fake_process_single_label(file, expected_fields, settings):
        if file.filename == "bad.png":
            raise UploadValidationError("Unsupported file type.")
        return _single_response(file.filename)

    monkeypatch.setattr(batch_service, "process_single_label", fake_process_single_label)

    response = await batch_service.verify_batch_labels(
        files=[_upload_file("good.png"), _upload_file("bad.png")],
        expected_fields=EXPECTED_FIELDS,
        settings=Settings(openai_api_key="test-key"),
    )

    assert response.total_labels == 2
    assert response.completed == 1
    assert response.status_counts == {"pass": 1, "fail": 0, "error": 1}
    assert [result.overall_status for result in response.results] == ["pass", "error"]
    assert response.results[1].error == "Unsupported file type."


def test_batch_service_returns_partial_failures(monkeypatch) -> None:
    asyncio.run(_run_partial_failure_test(monkeypatch))


async def _run_concurrency_test(monkeypatch) -> None:
    active_count = 0
    max_active_count = 0

    async def fake_process_single_label(file, expected_fields, settings):
        nonlocal active_count, max_active_count
        active_count += 1
        max_active_count = max(max_active_count, active_count)
        await asyncio.sleep(0.01)
        active_count -= 1
        return _single_response(file.filename, status="fail")

    monkeypatch.setattr(batch_service, "process_single_label", fake_process_single_label)

    response = await batch_service.verify_batch_labels(
        files=[_upload_file(f"label-{index}.png") for index in range(5)],
        expected_fields=EXPECTED_FIELDS,
        settings=Settings(openai_api_key="test-key", batch_concurrency=2),
    )

    assert response.total_labels == 5
    assert response.status_counts == {"pass": 0, "fail": 5, "error": 0}
    assert max_active_count <= 2


def test_batch_service_limits_concurrency(monkeypatch) -> None:
    asyncio.run(_run_concurrency_test(monkeypatch))
