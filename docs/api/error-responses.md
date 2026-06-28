# Error Responses

## Request-Level Error Shape

```json
{
  "detail": "User-facing error message."
}
```

## `/verify` Errors

| Status | Source | Example condition |
| ---: | --- | --- |
| `400` | `UploadValidationError` | Unsupported extension, MIME mismatch, empty file, oversized file, decoded pixel overflow, corrupt image. |
| `400` | `ImagePreprocessingError` | Image cannot be prepared for extraction. |
| `429` | `VerificationRateLimitError` | Daily verification unit cap exhausted before extraction. |
| `502` | `InvalidExtractionResponseError` | Provider response cannot be parsed into expected structured fields. |
| `502` | `ExtractionServiceError` | Provider unavailable, timed out, rate-limited, or returned an error. |
| `503` | `ExtractionConfigurationError` | `OPENAI_API_KEY` missing on backend. |
| `500` | unexpected exception | Safe generic server error. |

Rate-limit exhaustion returns request-level HTTP `429` before extraction:

```json
{
  "detail": "Daily verification limit reached. Please try again when the limit resets."
}
```

Rate-limit responses include `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers.

## `/verify-batch` Errors

Batch-level validation returns HTTP `400` for:

- fewer than 2 files
- more than `MAX_BATCH_SIZE` files
- duplicate basenames

The batch endpoint also returns request-level HTTP `429` when the daily verification unit cap cannot reserve one unit per submitted file.

Per-file processing failures return inside `results`:

```json
{
  "filename": "label.png",
  "overall_status": "error",
  "expected_fields": {
    "brand_name": "Example Brand",
    "class_type": "Example Class Type",
    "alcohol_content": "45% Alc./Vol. (90 Proof)",
    "net_contents": "750 mL",
    "government_warning": "<STANDARD_GOVERNMENT_WARNING>"
  },
  "extracted_fields": {
    "brand_name": null,
    "class_type": null,
    "alcohol_content": null,
    "net_contents": null,
    "government_warning_text": null,
    "raw_text": null
  },
  "field_results": [],
  "processing_time_ms": 1,
  "validation_time_ms": 0,
  "preprocessing_time_ms": 0,
  "extraction_time_ms": 0,
  "verification_time_ms": 0,
  "preprocessed_image_bytes": 0,
  "preprocessed_image_width": 0,
  "message": "This label could not be processed.",
  "error": "User-facing error message."
}
```

## Frontend Handling

`parseApiResponse` throws an `Error` using `detail` when available. Verification request errors, including daily-limit `429` responses, are displayed in the existing selected-label error state. `frontend/src/App.jsx` and `frontend/src/hooks/useQueueVerification.js` translate browser `Failed to fetch` into the shared service-unavailable message.
