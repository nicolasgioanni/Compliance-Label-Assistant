"""Coordinates single-label verification processing.

This service validates and preprocesses one uploaded image, sends it to the
extraction service, and then delegates deterministic field comparison to
verification_service.py.
"""

from fastapi import UploadFile

from app.config import Settings, get_settings
from app.schemas import ExpectedFields, SingleVerificationResponse
from app.services.image_preprocessor import preprocess_image_for_extraction
from app.services.openai_extraction_service import extract_label_fields
from app.services.timing_service import get_elapsed_ms, start_timer
from app.services.verification_service import calculate_overall_status, verify_expected_fields
from app.utils.file_validation import validate_upload_file


async def verify_single_label(
    file: UploadFile,
    expected_fields: ExpectedFields,
) -> SingleVerificationResponse:
    settings = get_settings()
    return await process_single_label(file=file, expected_fields=expected_fields, settings=settings)


async def process_single_label(
    file: UploadFile,
    expected_fields: ExpectedFields,
    settings: Settings,
) -> SingleVerificationResponse:
    processing_start = start_timer()

    original_image_bytes = await validate_upload_file(
        file,
        max_file_size_mb=settings.max_file_size_mb,
        max_image_pixels=settings.max_image_pixels,
    )
    preprocessed_image_bytes = preprocess_image_for_extraction(
        original_image_bytes,
        max_width=settings.max_image_width,
    )

    extraction_start = start_timer()
    extracted_fields = await extract_label_fields(preprocessed_image_bytes, settings)
    extraction_time_ms = max(get_elapsed_ms(extraction_start), 1)

    verification_start = start_timer()
    field_results = verify_expected_fields(expected_fields, extracted_fields)
    verification_time_ms = max(get_elapsed_ms(verification_start), 1)

    return SingleVerificationResponse(
        filename=file.filename or "uploaded-label",
        overall_status=calculate_overall_status(field_results),
        expected_fields=expected_fields,
        extracted_fields=extracted_fields,
        field_results=field_results,
        processing_time_ms=max(get_elapsed_ms(processing_start), 1),
        extraction_time_ms=extraction_time_ms,
        verification_time_ms=verification_time_ms,
        message="AI extraction completed and deterministic field verification was applied.",
    )
