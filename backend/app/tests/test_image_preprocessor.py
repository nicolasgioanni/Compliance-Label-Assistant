from io import BytesIO

from PIL import Image

from app.services.image_preprocessor import preprocess_image_for_extraction


def _image_bytes(mode: str = "RGBA", size: tuple[int, int] = (2000, 400)) -> bytes:
    buffer = BytesIO()
    Image.new(mode, size, color=(255, 255, 255, 255)).save(buffer, format="PNG")
    return buffer.getvalue()


def _open_output(image_bytes: bytes) -> Image.Image:
    return Image.open(BytesIO(image_bytes))


def test_preprocess_resizes_to_max_width() -> None:
    output_bytes = preprocess_image_for_extraction(_image_bytes(), max_width=1000)

    with _open_output(output_bytes) as image:
        assert image.format == "JPEG"
        assert image.width == 1000
        assert image.height == 200


def test_preprocess_converts_to_rgb_jpeg() -> None:
    output_bytes = preprocess_image_for_extraction(_image_bytes(mode="RGBA", size=(50, 50)), max_width=1000)

    with _open_output(output_bytes) as image:
        assert image.format == "JPEG"
        assert image.mode == "RGB"


def test_preprocess_handles_images_without_exif() -> None:
    output_bytes = preprocess_image_for_extraction(_image_bytes(mode="RGB", size=(50, 50)), max_width=1000)

    with _open_output(output_bytes) as image:
        assert image.size == (50, 50)

