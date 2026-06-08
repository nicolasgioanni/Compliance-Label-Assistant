# Logging And Errors

## Logging Configuration

Location:

- `backend/app/utils/logging_config.py`

`configure_logging()` calls `logging.basicConfig` with:

- level `INFO`
- format `%(asctime)s %(levelname)s %(name)s %(message)s`

`create_app()` calls `configure_logging()` before creating the FastAPI app.

## Error Handling

Application-wide unexpected error handling lives in `backend/app/main.py`.

Known verification errors are mapped in `backend/app/routes/verification.py`.

## Safe Logging Rules

Do not log:

- provider keys
- raw image bytes
- base64 image payloads
- full uploaded payloads
- full environment dumps
- real local `.env` contents

Current unexpected-error logging records only the exception class name.

## HTTP Error Responses

Known request-level errors return:

```json
{
  "detail": "User-facing error message."
}
```

Unexpected errors return:

```json
{
  "detail": "An unexpected server error occurred. Please try again."
}
```

## Related Docs

- [API error responses](../api/error-responses.md)
- [Architecture error handling](../architecture/error-handling.md)
