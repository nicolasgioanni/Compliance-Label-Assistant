"""Coordinates single-label Phase 2 processing.

This service validates and preprocesses one uploaded image, sends it to the
extraction service, and formats an extraction-backed response. It intentionally
does not perform deterministic field comparison yet; that belongs to Phase 3.
"""

from fastapi import UploadFile

from app.config import get_settings
from app.schemas import ExpectedFields, ExtractedFields, FieldResult, SingleVerificationResponse
from app.services.image_preprocessor import preprocess_image_for_extraction
from app.services.openai_extraction_service import extract_label_fields
from app.services.timing_service import get_elapsed_ms, start_timer
from app.utils.file_validation import validate_upload_file
from app.utils.response_builders import build_field_result


def _found_value(value: str | None) -> bool:
    return bool(value and value.strip())


def _build_extraction_field_result(field_name: str, expected: str, found: str | None) -> FieldResult:
    if _found_value(found):
        return build_field_result(
            field_name=field_name,
            expected=expected,
            found=found,
            status="needs_review",
            reason="Field text was extracted. Deterministic comparison is scheduled for Phase 3.",
            confidence=0.75,
        )

    return build_field_result(
        field_name=field_name,
        expected=expected,
        found=found,
        status="missing",
        reason="The extraction service did not find this expected field in the visible label text.",
        confidence=0.6,
    )


def build_phase_two_field_results(
    expected_fields: ExpectedFields,
    extracted_fields: ExtractedFields,
) -> list[FieldResult]:
    return [
        _build_extraction_field_result("brand_name", expected_fields.brand_name, extracted_fields.brand_name),
        _build_extraction_field_result("class_type", expected_fields.class_type, extracted_fields.class_type),
        _build_extraction_field_result(
            "alcohol_content",
            expected_fields.alcohol_content,
            extracted_fields.alcohol_content,
        ),
        _build_extraction_field_result("net_contents", expected_fields.net_contents, extracted_fields.net_contents),
        _build_extraction_field_result(
            "government_warning",
            expected_fields.government_warning,
            extracted_fields.government_warning_text,
        ),
    ]


async def verify_single_label(
    file: UploadFile,
    expected_fields: ExpectedFields,
) -> SingleVerificationResponse:
    settings = get_settings()
    processing_start = start_timer()

    original_image_bytes = await validate_upload_file(file, settings.max_file_size_mb)
    preprocessed_image_bytes = preprocess_image_for_extraction(
        original_image_bytes,
        max_width=settings.max_image_width,
    )

    extraction_start = start_timer()
    extracted_fields = await extract_label_fields(preprocessed_image_bytes, settings)
    extraction_time_ms = max(get_elapsed_ms(extraction_start), 1)

    verification_start = start_timer()
    field_results = build_phase_two_field_results(expected_fields, extracted_fields)
    verification_time_ms = max(get_elapsed_ms(verification_start), 1)

    return SingleVerificationResponse(
        filename=file.filename or "uploaded-label",
        overall_status="needs_review",
        expected_fields=expected_fields,
        extracted_fields=extracted_fields,
        field_results=field_results,
        processing_time_ms=max(get_elapsed_ms(processing_start), 1),
        extraction_time_ms=extraction_time_ms,
        verification_time_ms=verification_time_ms,
        message=(
            "AI extraction completed. Deterministic verification is not implemented yet, "
            "so all extracted fields require human review."
        ),
    )

