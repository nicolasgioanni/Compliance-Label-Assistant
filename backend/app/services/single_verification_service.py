"""Coordinates single-label verification processing.

This service validates and preprocesses one uploaded image, sends it to the
extraction provider, and then delegates deterministic field comparison to the
verification package.
"""

from fastapi import UploadFile

from app.config import Settings, get_settings
from app.image_processing.preprocessor import preprocess_image_for_extraction
from app.image_processing.validation import validate_upload_file
from app.providers.openai.extraction import extract_label_fields
from app.schemas import ExpectedFields, SingleVerificationResponse
from app.services.timing_service import get_elapsed_ms, start_timer
from app.verification.rules import calculate_overall_status, verify_expected_fields


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

    validation_start = start_timer()
    original_image_bytes = await validate_upload_file(
        file,
        max_file_size_mb=settings.max_file_size_mb,
        max_image_pixels=settings.max_image_pixels,
    )
    validation_time_ms = max(get_elapsed_ms(validation_start), 1)

    preprocessing_start = start_timer()
    preprocessed_image = preprocess_image_for_extraction(
        original_image_bytes,
        max_width=settings.max_image_width,
        jpeg_quality=settings.jpeg_quality,
    )
    preprocessing_time_ms = max(get_elapsed_ms(preprocessing_start), 1)

    extraction_start = start_timer()
    extracted_fields = await extract_label_fields(preprocessed_image.image_bytes, settings)
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
        validation_time_ms=validation_time_ms,
        preprocessing_time_ms=preprocessing_time_ms,
        extraction_time_ms=extraction_time_ms,
        verification_time_ms=verification_time_ms,
        preprocessed_image_bytes=preprocessed_image.byte_count,
        preprocessed_image_width=preprocessed_image.width,
        message="AI extraction completed and deterministic field verification was applied.",
    )
