"""Handles image resizing and compression before OpenAI extraction.

This service only prepares uploaded image bytes for fast, lower-cost model
input. It does not validate business fields, call OpenAI, store files, or make
compliance decisions. All processing is in memory.
"""

from dataclasses import dataclass
from io import BytesIO

from PIL import Image, ImageOps, UnidentifiedImageError

from app.utils.file_validation import SUPPORTED_IMAGE_DESCRIPTION


class ImagePreprocessingError(ValueError):
    """Raised when an uploaded image cannot be prepared for extraction."""


@dataclass(frozen=True)
class PreprocessedImage:
    image_bytes: bytes
    width: int
    height: int
    byte_count: int


def _resize_if_needed(image: Image.Image, max_width: int) -> Image.Image:
    if image.width <= max_width:
        return image

    resize_ratio = max_width / image.width
    new_height = max(1, int(image.height * resize_ratio))
    return image.resize((max_width, new_height), Image.Resampling.LANCZOS)


def preprocess_image_for_extraction(
    file_bytes: bytes,
    max_width: int,
    jpeg_quality: int = 65,
) -> PreprocessedImage:
    try:
        with Image.open(BytesIO(file_bytes)) as uploaded_image:
            oriented_image = ImageOps.exif_transpose(uploaded_image)
            rgb_image = oriented_image.convert("RGB")
            resized_image = _resize_if_needed(rgb_image, max_width)

            output_buffer = BytesIO()
            resized_image.save(
                output_buffer,
                format="JPEG",
                quality=jpeg_quality,
                optimize=True,
            )
            output_bytes = output_buffer.getvalue()
            return PreprocessedImage(
                image_bytes=output_bytes,
                width=resized_image.width,
                height=resized_image.height,
                byte_count=len(output_bytes),
            )
    except (OSError, UnidentifiedImageError) as exc:
        raise ImagePreprocessingError(
            "The uploaded image could not be processed. "
            f"Please upload a readable {SUPPORTED_IMAGE_DESCRIPTION} label image."
        ) from exc
