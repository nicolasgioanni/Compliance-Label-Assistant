# API Endpoints

## `GET /health`

Purpose: check backend availability.

Request:

- Method: `GET`
- Body: none
- Auth: none

Response status:

- `200`

Response example:

```json
{
  "status": "ok",
  "service": "alcohol-label-verification-api"
}
```

Frontend caller:

- `checkHealth` in `frontend/src/api/verificationApi.js`

Backend handler:

- `health_check` in `backend/app/routes/health.py`

## `POST /warmup`

Purpose: initialize reusable backend dependencies without uploading files or making an extraction request.

Request:

- Method: `POST`
- Body: none
- Auth: none

Response status:

- `200`

Response example:

```json
{
  "status": "ok"
}
```

Frontend caller:

- `warmVerificationBackend` in `frontend/src/api/verificationApi.js`

Backend handler:

- `warmup` in `backend/app/routes/warmup.py`

Service:

- `warm_verification_dependencies` in `backend/app/services/warmup_service.py`

Notes:

- Skips provider client initialization when `OPENAI_API_KEY` is missing.
- Builds the cached provider client when possible.
- When `OPENAI_NETWORK_WARMUP` is enabled, makes one best-effort model metadata request for `OPENAI_MODEL`.
- Does not send image files, provider request content, expected fields, extracted fields, or extraction request bodies.
- Does not call the extraction endpoint or `responses.parse`.
- Swallows warmup failures.

## `POST /verify`

Purpose: verify one uploaded label image against expected application fields.

Request:

- Method: `POST`
- Content type: `multipart/form-data`
- Auth: none

Form fields:

| Field | Type | Required by route | Purpose |
| --- | --- | --- | --- |
| `file` | file | Yes | Label image. |
| `brand_name` | string | Yes | Expected brand name. |
| `class_type` | string | Yes | Expected class or type; backend skips this comparison when the submitted value is blank. |
| `alcohol_content` | string | Yes | Expected ABV/proof text; backend skips this comparison when the submitted value is blank. |
| `net_contents` | string | Yes | Expected net contents; backend skips this comparison when the submitted value is blank. |
| `bottler_producer` | string | No | Expected bottler/producer text; defaults to blank and is skipped when blank. |
| `country_of_origin` | string | No | Expected country of origin; defaults to blank and is skipped when blank. |
| `government_warning` | string | Yes | Accepted for API compatibility; backend verifies against server-owned standard text. |

Supported file types:

- JPG/JPEG
- PNG
- WebP
- TIFF/TIF

Example request shape:

```text
file=<IMAGE_FILE>
brand_name=Example Brand
class_type=Example Class Type
alcohol_content=45% Alc./Vol. (90 Proof)
net_contents=750 mL
bottler_producer=Example Bottler, Louisville, KY
country_of_origin=USA
government_warning=<STANDARD_GOVERNMENT_WARNING>
```

Response statuses:

- `200`: verification completed.
- `400`: upload validation or preprocessing error.
- `429`: daily verification unit cap exhausted.
- `502`: provider service or provider response error.
- `503`: missing backend provider configuration.
- `500`: unexpected server error.

Response example:

```json
{
  "filename": "label.png",
  "overall_status": "fail",
  "expected_fields": {
    "brand_name": "Example Brand",
    "class_type": "Example Class Type",
    "alcohol_content": "45% Alc./Vol. (90 Proof)",
    "net_contents": "750 mL",
    "bottler_producer": "Example Bottler, Louisville, KY",
    "country_of_origin": "USA",
    "government_warning": "<STANDARD_GOVERNMENT_WARNING>"
  },
  "extracted_fields": {
    "brand_name": "Example Brand",
    "class_type": "Example Class Type",
    "alcohol_content": "90 Proof",
    "net_contents": "750 mL",
    "bottler_producer": "Example Bottler, Louisville, KY",
    "country_of_origin": "USA",
    "government_warning_text": "<EXTRACTED_WARNING_TEXT>",
    "raw_text": null
  },
  "field_results": [
    {
      "field_name": "brand_name",
      "expected": "Example Brand",
      "found": "Example Brand",
      "status": "pass",
      "reason": "Brand name matches exactly.",
      "confidence": 1
    }
  ],
  "processing_time_ms": 1200,
  "validation_time_ms": 20,
  "preprocessing_time_ms": 40,
  "extraction_time_ms": 1135,
  "verification_time_ms": 1,
  "preprocessed_image_bytes": 92000,
  "preprocessed_image_width": 640,
  "message": "<VERIFICATION_MESSAGE>",
  "error": null
}
```

Frontend caller:

- `verifySingleLabel` in `frontend/src/api/verificationApi.js`

Backend handler:

- `verify_label` in `backend/app/routes/verification.py`

Services:

- `verify_single_label`
- `process_single_label`

Validation rules:

- Filename is required.
- Extension, MIME type, decoded image format, and decoded content must match supported image types.
- File must be non-empty and smaller than `MAX_FILE_SIZE_MB`.
- Decoded pixel count must be at or below `MAX_IMAGE_PIXELS` when that setting is positive.
- Unreadable and decompression-bomb style images are rejected before extraction.

Performance notes:

- One provider extraction call occurs per successful `/verify` request.
- One verification unit is reserved before processing. When the daily cap is exhausted, the request returns `429` before extraction.
- Image bytes are preprocessed before provider extraction.

## `POST /verify-batch`

Purpose: verify a batch of label images against one shared expected field set.

Request:

- Method: `POST`
- Content type: `multipart/form-data`
- Auth: none

Form fields:

| Field | Type | Required by route | Purpose |
| --- | --- | --- | --- |
| `files` | file list | Yes | Label images. |
| `brand_name` | string | Yes | Shared expected brand name. |
| `class_type` | string | Yes | Shared expected class or type; backend skips this comparison when the submitted value is blank. |
| `alcohol_content` | string | Yes | Shared expected ABV/proof text; backend skips this comparison when the submitted value is blank. |
| `net_contents` | string | Yes | Shared expected net contents; backend skips this comparison when the submitted value is blank. |
| `bottler_producer` | string | No | Shared expected bottler/producer text; defaults to blank and is skipped when blank. |
| `country_of_origin` | string | No | Shared expected country of origin; defaults to blank and is skipped when blank. |
| `government_warning` | string | Yes | Accepted for API compatibility; backend verifies against server-owned standard text. |

Batch validation:

- At least 2 files.
- At most `MAX_BATCH_SIZE` files.
- Duplicate basenames are rejected case-insensitively before processing.

Response statuses:

- `200`: batch request completed, including possible per-file errors.
- `400`: invalid batch-level request.
- `429`: daily verification unit cap exhausted before per-file processing.
- `500`: unexpected server error.

Response example:

```json
{
  "mode": "batch",
  "total_labels": 2,
  "completed": 1,
  "status_counts": {
    "pass": 1,
    "fail": 0,
    "error": 1
  },
  "total_processing_time_ms": 2400,
  "results": [
    {
      "filename": "label-a.png",
      "overall_status": "pass",
      "expected_fields": {
        "brand_name": "Example Brand",
        "class_type": "Example Class Type",
        "alcohol_content": "45% Alc./Vol. (90 Proof)",
        "net_contents": "750 mL",
        "bottler_producer": "Example Bottler, Louisville, KY",
        "country_of_origin": "USA",
        "government_warning": "<STANDARD_GOVERNMENT_WARNING>"
      },
      "extracted_fields": {
        "brand_name": "Example Brand",
        "class_type": "Example Class Type",
        "alcohol_content": "90 Proof",
        "net_contents": "750 mL",
        "bottler_producer": "Example Bottler, Louisville, KY",
        "country_of_origin": "USA",
        "government_warning_text": "<EXTRACTED_WARNING_TEXT>",
        "raw_text": null
      },
      "field_results": [
        {
          "field_name": "brand_name",
          "expected": "Example Brand",
          "found": "Example Brand",
          "status": "pass",
          "reason": "Brand name matches exactly.",
          "confidence": 1
        }
      ],
      "processing_time_ms": 1200,
      "validation_time_ms": 20,
      "preprocessing_time_ms": 40,
      "extraction_time_ms": 1135,
      "verification_time_ms": 1,
      "preprocessed_image_bytes": 92000,
      "preprocessed_image_width": 640,
      "message": "<VERIFICATION_MESSAGE>",
      "error": null
    }
  ]
}
```

Frontend caller:

- None in the current frontend.

Backend handler:

- `verify_batch` in `backend/app/routes/verification.py`

Service:

- `verify_batch_labels` in `backend/app/services/batch_service.py`

Performance notes:

- Uses `BATCH_CONCURRENCY` for per-file processing.
- Each successfully processed file can make one provider extraction call.
- After batch-level validation, the backend reserves one verification unit per submitted file before per-file processing starts.
