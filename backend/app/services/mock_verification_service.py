"""Builds Phase 1 mock verification responses.

This service exists only to support the first vertical slice of the app shell.
It does not perform AI extraction, image preprocessing, or deterministic
compliance verification. Those responsibilities will be added in separate
services in later phases so route handlers remain thin and decisions stay
auditable.
"""

from app.schemas import ExpectedFields, ExtractedFields, FieldResult, SingleVerificationResponse
from app.services.timing_service import get_elapsed_ms, start_timer
from app.utils.response_builders import build_field_result


def _build_mock_extracted_fields(expected_fields: ExpectedFields) -> ExtractedFields:
    raw_text = "\n".join(
        [
            expected_fields.brand_name,
            expected_fields.class_type,
            expected_fields.alcohol_content,
            expected_fields.net_contents,
            expected_fields.government_warning,
        ]
    )
    return ExtractedFields(
        brand_name=expected_fields.brand_name,
        class_type=expected_fields.class_type,
        alcohol_content=expected_fields.alcohol_content,
        net_contents=expected_fields.net_contents,
        government_warning_text=expected_fields.government_warning,
        raw_text=raw_text,
    )


def _build_mock_field_results(expected: ExpectedFields, extracted: ExtractedFields) -> list[FieldResult]:
    return [
        build_field_result(
            field_name="brand_name",
            expected=expected.brand_name,
            found=extracted.brand_name,
            status="pass",
            reason="Mock response: field is treated as matching for the Phase 1 UI flow.",
            confidence=0.99,
        ),
        build_field_result(
            field_name="class_type",
            expected=expected.class_type,
            found=extracted.class_type,
            status="pass",
            reason="Mock response: field is treated as matching for the Phase 1 UI flow.",
            confidence=0.99,
        ),
        build_field_result(
            field_name="alcohol_content",
            expected=expected.alcohol_content,
            found=extracted.alcohol_content,
            status="pass",
            reason="Mock response: field is treated as matching for the Phase 1 UI flow.",
            confidence=0.99,
        ),
        build_field_result(
            field_name="net_contents",
            expected=expected.net_contents,
            found=extracted.net_contents,
            status="pass",
            reason="Mock response: field is treated as matching for the Phase 1 UI flow.",
            confidence=0.99,
        ),
        build_field_result(
            field_name="government_warning",
            expected=expected.government_warning,
            found=extracted.government_warning_text,
            status="needs_review",
            reason="Mock response: warning text is shown for human review until real validation is implemented.",
            confidence=0.9,
        ),
    ]


def build_mock_verification(filename: str, expected_fields: ExpectedFields) -> SingleVerificationResponse:
    timer_start = start_timer()
    extracted_fields = _build_mock_extracted_fields(expected_fields)
    field_results = _build_mock_field_results(expected_fields, extracted_fields)
    processing_time_ms = max(get_elapsed_ms(timer_start), 1)

    return SingleVerificationResponse(
        filename=filename,
        overall_status="needs_review",
        expected_fields=expected_fields,
        extracted_fields=extracted_fields,
        field_results=field_results,
        processing_time_ms=processing_time_ms,
        extraction_time_ms=0,
        verification_time_ms=processing_time_ms,
        message="Mock verification only. AI extraction and deterministic verification are not implemented yet.",
    )

