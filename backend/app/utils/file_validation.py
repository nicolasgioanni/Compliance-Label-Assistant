"""Validates uploaded files before image preprocessing.

This module handles file type, size, batch-limit scaffolding, and image
openability checks. It does not store uploads or inspect label compliance
content. Backend validation is required even when the frontend shows warnings.
"""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError


ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png"}


class UploadValidationError(ValueError):
    """Raised when an uploaded file fails user-fixable validation."""


def _max_size_bytes(max_file_size_mb: int) -> int:
    return max_file_size_mb * 1024 * 1024


def validate_batch_size(file_count: int, max_batch_size: int) -> None:
    if file_count > max_batch_size:
        raise UploadValidationError(f"Batch size limit exceeded. Upload {max_batch_size} files or fewer.")


def validate_upload_metadata(file: UploadFile) -> None:
    filename = file.filename or ""
    extension = Path(filename).suffix.lower()

    if not filename:
        raise UploadValidationError("Please upload a label image.")

    if extension not in ALLOWED_EXTENSIONS:
        raise UploadValidationError("Unsupported file extension. Please upload a JPG or PNG image.")

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise UploadValidationError("Unsupported file type. Please upload a JPG or PNG image.")


def validate_file_size(file_bytes: bytes, max_file_size_mb: int) -> None:
    if not file_bytes:
        raise UploadValidationError("The uploaded file is empty. Please upload a JPG or PNG label image.")

    if len(file_bytes) > _max_size_bytes(max_file_size_mb):
        raise UploadValidationError(f"File too large. Upload an image smaller than {max_file_size_mb} MB.")


def validate_image_can_open(file_bytes: bytes) -> None:
    try:
        with Image.open(BytesIO(file_bytes)) as image:
            image.verify()
    except (OSError, UnidentifiedImageError) as exc:
        raise UploadValidationError(
            "The uploaded file could not be opened as an image. Please upload a readable JPG or PNG label image."
        ) from exc


async def validate_upload_file(file: UploadFile, max_file_size_mb: int) -> bytes:
    validate_upload_metadata(file)
    file_bytes = await file.read()
    validate_file_size(file_bytes, max_file_size_mb)
    validate_image_can_open(file_bytes)
    return file_bytes

