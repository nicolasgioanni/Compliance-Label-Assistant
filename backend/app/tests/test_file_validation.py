import asyncio
from io import BytesIO

import pytest
from fastapi import UploadFile
from PIL import Image
from starlette.datastructures import Headers

from app.utils.file_validation import UploadValidationError, validate_batch_size, validate_upload_file


def _image_bytes(image_format: str) -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (12, 12), color="white").save(buffer, format=image_format)
    return buffer.getvalue()


def _upload(filename: str, content_type: str, content: bytes) -> UploadFile:
    return UploadFile(
        filename=filename,
        file=BytesIO(content),
        headers=Headers({"content-type": content_type}),
    )


def _validate(file: UploadFile, max_file_size_mb: int = 5) -> bytes:
    return asyncio.run(validate_upload_file(file, max_file_size_mb=max_file_size_mb))


@pytest.mark.parametrize(
    ("filename", "content_type", "image_format"),
    [
        ("label.png", "image/png", "PNG"),
        ("label.jpg", "image/jpeg", "JPEG"),
        ("label.jpeg", "image/jpeg", "JPEG"),
        ("label.webp", "image/webp", "WEBP"),
        ("label.tif", "image/tiff", "TIFF"),
        ("label.tiff", "image/tiff", "TIFF"),
    ],
)
def test_supported_images_accepted(filename: str, content_type: str, image_format: str) -> None:
    file_bytes = _validate(_upload(filename, content_type, _image_bytes(image_format)))
    assert file_bytes


def test_svg_rejected() -> None:
    with pytest.raises(UploadValidationError, match="Unsupported file extension"):
        _validate(_upload("label.svg", "image/svg+xml", b"<svg />"))


def test_exe_rejected() -> None:
    with pytest.raises(UploadValidationError, match="Unsupported file extension"):
        _validate(_upload("label.exe", "application/octet-stream", b"binary"))


def test_oversized_file_rejected() -> None:
    with pytest.raises(UploadValidationError, match="File too large"):
        _validate(_upload("label.png", "image/png", _image_bytes("PNG")), max_file_size_mb=0)


def test_empty_file_rejected() -> None:
    with pytest.raises(UploadValidationError, match="empty"):
        _validate(_upload("label.png", "image/png", b""))


def test_corrupt_image_rejected() -> None:
    with pytest.raises(UploadValidationError, match="could not be opened"):
        _validate(_upload("label.png", "image/png", b"not an image"))


def test_mismatched_decoded_image_format_rejected() -> None:
    with pytest.raises(UploadValidationError, match="File extension does not match image content"):
        _validate(_upload("label.png", "image/png", _image_bytes("WEBP")))


def test_mismatched_content_type_rejected() -> None:
    with pytest.raises(UploadValidationError, match="File type does not match image content"):
        _validate(_upload("label.webp", "image/png", _image_bytes("WEBP")))


def test_batch_too_large_rejected() -> None:
    with pytest.raises(UploadValidationError, match="Batch size limit exceeded"):
        validate_batch_size(file_count=11, max_batch_size=10)
