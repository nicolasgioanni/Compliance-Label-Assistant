"""Validates uploaded files before image preprocessing.

This module handles file type, size, and image openability checks. It does not
store uploads or inspect label compliance content. Backend validation is
required even when the frontend shows warnings.
"""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError


SUPPORTED_IMAGE_DESCRIPTION = "JPG, PNG, WebP, or TIFF"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/tiff"}
IMAGE_FORMAT_BY_EXTENSION = {
    ".jpg": "JPEG",
    ".jpeg": "JPEG",
    ".png": "PNG",
    ".webp": "WEBP",
    ".tif": "TIFF",
    ".tiff": "TIFF",
}
MIME_TYPES_BY_IMAGE_FORMAT = {
    "JPEG": {"image/jpeg"},
    "PNG": {"image/png"},
    "WEBP": {"image/webp"},
    "TIFF": {"image/tiff"},
}


class UploadValidationError(ValueError):
    """Raised when an uploaded file fails user-fixable validation."""


def _max_size_bytes(max_file_size_mb: int) -> int:
    return max_file_size_mb * 1024 * 1024


def validate_upload_metadata(file: UploadFile) -> tuple[str, str]:
    filename = (file.filename or "").strip()
    extension = Path(filename).suffix.lower()
    content_type = (file.content_type or "").lower()

    if not filename:
        raise UploadValidationError("Please upload a label image.")

    if extension not in ALLOWED_EXTENSIONS:
        raise UploadValidationError(f"Unsupported file extension. Please upload a {SUPPORTED_IMAGE_DESCRIPTION} image.")

    if content_type not in ALLOWED_MIME_TYPES:
        raise UploadValidationError(f"Unsupported file type. Please upload a {SUPPORTED_IMAGE_DESCRIPTION} image.")

    return extension, content_type


def validate_file_size(file_bytes: bytes, max_file_size_mb: int) -> None:
    if not file_bytes:
        raise UploadValidationError(
            f"The uploaded file is empty. Please upload a {SUPPORTED_IMAGE_DESCRIPTION} label image."
        )

    if len(file_bytes) > _max_size_bytes(max_file_size_mb):
        raise UploadValidationError(f"File too large. Upload an image smaller than {max_file_size_mb} MB.")


def validate_image_can_open(file_bytes: bytes, extension: str, content_type: str, max_image_pixels: int) -> None:
    try:
        with Image.open(BytesIO(file_bytes)) as image:
            image_format = image.format
            pixel_count = image.width * image.height
            validate_image_pixel_count(pixel_count, max_image_pixels)
            image.verify()
    except (OSError, UnidentifiedImageError, Image.DecompressionBombError) as exc:
        raise UploadValidationError(
            "The uploaded file could not be opened as an image. "
            f"Please upload a readable {SUPPORTED_IMAGE_DESCRIPTION} label image."
        ) from exc

    if image_format not in MIME_TYPES_BY_IMAGE_FORMAT:
        raise UploadValidationError(f"Unsupported image content. Please upload a {SUPPORTED_IMAGE_DESCRIPTION} image.")

    expected_format = IMAGE_FORMAT_BY_EXTENSION[extension]
    if image_format != expected_format:
        raise UploadValidationError(
            "File extension does not match image content. "
            f"Please upload a valid {SUPPORTED_IMAGE_DESCRIPTION} image."
        )

    if content_type not in MIME_TYPES_BY_IMAGE_FORMAT[image_format]:
        raise UploadValidationError(
            "File type does not match image content. "
            f"Please upload a valid {SUPPORTED_IMAGE_DESCRIPTION} image."
        )


def validate_image_pixel_count(pixel_count: int, max_image_pixels: int) -> None:
    if max_image_pixels > 0 and pixel_count > max_image_pixels:
        raise UploadValidationError(
            f"Image dimensions too large. Upload an image with {max_image_pixels:,} pixels or fewer."
        )


async def validate_upload_file(file: UploadFile, max_file_size_mb: int, max_image_pixels: int) -> bytes:
    extension, content_type = validate_upload_metadata(file)
    file_bytes = await file.read()
    validate_file_size(file_bytes, max_file_size_mb)
    validate_image_can_open(file_bytes, extension, content_type, max_image_pixels)
    return file_bytes
