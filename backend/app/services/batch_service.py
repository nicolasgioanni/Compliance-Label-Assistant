"""Coordinates limited batch verification.

This service owns batch orchestration only. It reuses the single-label pipeline
for validation, preprocessing, AI extraction, and deterministic verification so
the batch route stays thin and field comparison remains auditable.
"""

from __future__ import annotations

import asyncio

from fastapi import UploadFile

from app.config import Settings, get_settings
from app.image_processing.preprocessor import ImagePreprocessingError
from app.image_processing.validation import UploadValidationError
from app.providers.openai.extraction import (
    ExtractionConfigurationError,
    ExtractionServiceError,
    InvalidExtractionResponseError,
)
from app.schemas import (
    BatchVerificationItem,
    BatchVerificationResponse,
    ExpectedFields,
    ExtractedFields,
    OverallStatus,
)
from app.services.single_verification_service import process_single_label
from app.services.timing_service import get_elapsed_ms, start_timer


MIN_BATCH_SIZE = 2
OVERALL_STATUS_KEYS: tuple[OverallStatus, ...] = ("pass", "fail", "error")


class BatchRequestValidationError(ValueError):
    """Raised when the whole batch request is not valid."""


def validate_batch_request(file_count: int, max_batch_size: int) -> None:
    if file_count < MIN_BATCH_SIZE:
        raise BatchRequestValidationError("Batch verification requires at least 2 label images.")
    if file_count > max_batch_size:
        raise BatchRequestValidationError(f"Batch size limit exceeded. Upload {max_batch_size} files or fewer.")


def validate_batch_filenames(files: list[UploadFile]) -> None:
    seen_filenames: set[str] = set()
    duplicate_count = 0

    for file in files:
        normalized_filename = _normalize_filename(file.filename)
        if not normalized_filename:
            continue

        if normalized_filename in seen_filenames:
            duplicate_count += 1
            continue

        seen_filenames.add(normalized_filename)

    if duplicate_count:
        raise BatchRequestValidationError(_build_duplicate_files_message(duplicate_count))


async def verify_batch_labels(
    files: list[UploadFile],
    expected_fields: ExpectedFields,
    settings: Settings | None = None,
) -> BatchVerificationResponse:
    active_settings = settings or get_settings()
    validate_batch_request(len(files), active_settings.max_batch_size)
    validate_batch_filenames(files)

    total_start = start_timer()
    semaphore = asyncio.Semaphore(max(active_settings.batch_concurrency, 1))
    tasks = [
        _process_batch_file(
            file=file,
            expected_fields=expected_fields,
            settings=active_settings,
            semaphore=semaphore,
        )
        for file in files
    ]
    results = await asyncio.gather(*tasks)
    status_counts = _build_status_counts(results)

    return BatchVerificationResponse(
        total_labels=len(results),
        completed=sum(1 for result in results if result.overall_status != "error"),
        status_counts=status_counts,
        total_processing_time_ms=max(get_elapsed_ms(total_start), 1),
        results=results,
    )


async def _process_batch_file(
    file: UploadFile,
    expected_fields: ExpectedFields,
    settings: Settings,
    semaphore: asyncio.Semaphore,
) -> BatchVerificationItem:
    async with semaphore:
        processing_start = start_timer()
        try:
            single_result = await process_single_label(
                file=file,
                expected_fields=expected_fields,
                settings=settings,
            )
            return BatchVerificationItem(**single_result.model_dump())
        except (
            UploadValidationError,
            ImagePreprocessingError,
            ExtractionConfigurationError,
            InvalidExtractionResponseError,
            ExtractionServiceError,
        ) as exc:
            return _build_error_item(file, expected_fields, processing_start, str(exc))
        except Exception:
            return _build_error_item(
                file,
                expected_fields,
                processing_start,
                "This file could not be processed. Please verify the image and try again.",
            )


def _build_error_item(
    file: UploadFile,
    expected_fields: ExpectedFields,
    processing_start: float,
    error_message: str,
) -> BatchVerificationItem:
    return BatchVerificationItem(
        filename=file.filename or "uploaded-label",
        overall_status="error",
        expected_fields=expected_fields,
        extracted_fields=ExtractedFields(),
        field_results=[],
        processing_time_ms=max(get_elapsed_ms(processing_start), 1),
        validation_time_ms=0,
        preprocessing_time_ms=0,
        extraction_time_ms=0,
        verification_time_ms=0,
        preprocessed_image_bytes=0,
        preprocessed_image_width=0,
        message="This label could not be processed.",
        error=error_message,
    )


def _build_status_counts(results: list[BatchVerificationItem]) -> dict[str, int]:
    counts = {status: 0 for status in OVERALL_STATUS_KEYS}
    for result in results:
        counts[result.overall_status] += 1
    return counts


def _normalize_filename(filename: str | None) -> str:
    trimmed_filename = (filename or "").strip()
    basename = trimmed_filename.replace("\\", "/").rsplit("/", maxsplit=1)[-1]
    return basename.strip().casefold()


def _build_duplicate_files_message(duplicate_count: int) -> str:
    file_label = "file was" if duplicate_count == 1 else "files were"
    return f"{duplicate_count} duplicate {file_label} detected and not uploaded."
