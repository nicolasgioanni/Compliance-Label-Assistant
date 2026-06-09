# Image Processing

## Validation Module

Location: `backend/app/image_processing/validation.py`

Supported image types:

- JPG/JPEG
- PNG
- WebP
- TIFF/TIF

Validation steps:

1. Require a non-empty filename.
2. Check extension against `ALLOWED_EXTENSIONS`.
3. Check content type against `ALLOWED_MIME_TYPES`.
4. Read uploaded bytes.
5. Reject empty files.
6. Reject files larger than `MAX_FILE_SIZE_MB`.
7. Open image with Pillow and reject unreadable or decompression-bomb style images.
8. Check decoded pixel count against `MAX_IMAGE_PIXELS`.
9. Verify decoded image content.
10. Ensure decoded format matches extension and MIME type.

Main exports:

- `UploadValidationError`
- `SUPPORTED_IMAGE_DESCRIPTION`
- `validate_upload_metadata`
- `validate_file_size`
- `validate_image_can_open`
- `validate_image_pixel_count`
- `validate_upload_file`

## Preprocessing Module

Location: `backend/app/image_processing/preprocessor.py`

Preprocessing steps:

1. Open bytes with Pillow.
2. Apply EXIF orientation through `ImageOps.exif_transpose`.
3. Convert to RGB.
4. Resize only if image width exceeds `MAX_IMAGE_WIDTH`.
5. Save as optimized JPEG using `JPEG_QUALITY`.
6. Return `PreprocessedImage`.

Main exports:

- `ImagePreprocessingError`
- `PreprocessedImage`
- `preprocess_image_for_extraction`

## Side Effects

- Reads upload bytes from `UploadFile`.
- Performs all image work in memory.
- Does not write uploaded files to disk.
- Does not inspect label compliance content.

## Error Behavior

Validation and preprocessing raise user-fixable errors that route handlers map to HTTP `400`.

## Performance Notes

Smaller `MAX_IMAGE_WIDTH` and lower `JPEG_QUALITY` reduce provider payload size. Increasing either setting can improve readability for small text but may increase latency and provider usage.
