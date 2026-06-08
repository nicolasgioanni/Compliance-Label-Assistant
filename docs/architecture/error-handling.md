# Error Handling

## Frontend Errors

Frontend API calls use `parseApiResponse` in `frontend/src/api/verificationApi.js`.

Behavior:

- Attempts to parse JSON response bodies.
- Throws `Error(detail)` for non-OK responses when `detail` is present.
- Falls back to `The verification service returned an error.`.
- Treats browser `Failed to fetch` as service unavailable in `frontend/src/App.jsx` and `frontend/src/hooks/useQueueVerification.js`.

`frontend/src/App.jsx` owns the active error banner. New errors replace older errors and call the previous dismissal callback when present.

## Backend Request Errors

`backend/app/routes/verification.py` maps known errors:

| Error class | Endpoint behavior |
| --- | --- |
| `UploadValidationError` | `400` |
| `ImagePreprocessingError` | `400` |
| `ExtractionConfigurationError` | `503` |
| `InvalidExtractionResponseError` | `502` |
| `ExtractionServiceError` | `502` |
| `BatchRequestValidationError` | `400` |

Response shape:

```json
{
  "detail": "User-facing error message."
}
```

## Unexpected Errors

`handle_unexpected_error` in `backend/app/main.py` handles unhandled exceptions:

- Logs only the exception class name.
- Returns HTTP `500`.
- Returns safe JSON:

```json
{
  "detail": "An unexpected server error occurred. Please try again."
}
```

## Batch Per-File Errors

The `/verify-batch` endpoint rejects invalid batch-level requests before processing. During per-file processing, known validation, preprocessing, configuration, provider, and unexpected errors are converted into result items with:

- `overall_status: "error"`
- empty `field_results`
- empty `ExtractedFields`
- phase timing values set to `0` where the phase did not complete
- safe `message` and `error` strings

## CORS Errors

CORS is configured in `backend/app/main.py` from `settings.allowed_origins`. Browser requests fail when `ALLOWED_ORIGINS` does not include the active frontend origin. Local scripts add the selected frontend origin to process-level `ALLOWED_ORIGINS`.

## What Not To Do

- Do not expose provider keys in frontend errors.
- Do not log raw image bytes, base64 payloads, or full uploaded payloads.
- Do not return stack traces to the browser.
- Do not replace structured route error mapping with generic failures.
