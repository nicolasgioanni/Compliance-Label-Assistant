from io import BytesIO

from PIL import Image

from app.config import Settings
from app.services.image_preprocessor import preprocess_image_for_extraction


def _image_bytes(mode: str = "RGBA", size: tuple[int, int] = (2000, 400)) -> bytes:
    buffer = BytesIO()
    Image.new(mode, size, color=(255, 255, 255, 255)).save(buffer, format="PNG")
    return buffer.getvalue()


def _open_output(image_bytes: bytes) -> Image.Image:
    return Image.open(BytesIO(image_bytes))


def test_preprocess_resizes_to_max_width() -> None:
    preprocessed_image = preprocess_image_for_extraction(_image_bytes(), max_width=640)

    with _open_output(preprocessed_image.image_bytes) as image:
        assert image.format == "JPEG"
        assert image.width == 640
        assert image.height == 128
    assert preprocessed_image.width == 640
    assert preprocessed_image.height == 128
    assert preprocessed_image.byte_count == len(preprocessed_image.image_bytes)


def test_preprocess_converts_to_rgb_jpeg() -> None:
    preprocessed_image = preprocess_image_for_extraction(_image_bytes(mode="RGBA", size=(50, 50)), max_width=1000)

    with _open_output(preprocessed_image.image_bytes) as image:
        assert image.format == "JPEG"
        assert image.mode == "RGB"


def test_preprocess_handles_images_without_exif() -> None:
    preprocessed_image = preprocess_image_for_extraction(_image_bytes(mode="RGB", size=(50, 50)), max_width=1000)

    with _open_output(preprocessed_image.image_bytes) as image:
        assert image.size == (50, 50)


def test_preprocess_applies_jpeg_quality() -> None:
    buffer = BytesIO()
    Image.effect_noise((400, 400), 80).convert("RGB").save(buffer, format="PNG")
    source_bytes = buffer.getvalue()

    low_quality = preprocess_image_for_extraction(source_bytes, max_width=400, jpeg_quality=50)
    high_quality = preprocess_image_for_extraction(source_bytes, max_width=400, jpeg_quality=95)

    assert low_quality.byte_count < high_quality.byte_count


def test_fast_preprocessing_defaults_are_configured(monkeypatch) -> None:
    monkeypatch.delenv("MAX_IMAGE_WIDTH", raising=False)
    monkeypatch.delenv("JPEG_QUALITY", raising=False)

    settings = Settings()
    assert settings.max_image_width == 640
    assert settings.jpeg_quality == 60


def test_preprocess_default_jpeg_quality_is_fast_profile_quality() -> None:
    buffer = BytesIO()
    Image.effect_noise((400, 400), 80).convert("RGB").save(buffer, format="PNG")
    source_bytes = buffer.getvalue()

    default_quality = preprocess_image_for_extraction(source_bytes, max_width=400)
    explicit_fast_quality = preprocess_image_for_extraction(source_bytes, max_width=400, jpeg_quality=60)

    assert default_quality.byte_count == explicit_fast_quality.byte_count
