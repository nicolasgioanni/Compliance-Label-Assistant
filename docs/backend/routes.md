# Backend Routes

## Route Files

| File | Endpoints |
| --- | --- |
| `backend/app/routes/health.py` | `GET /health` |
| `backend/app/routes/warmup.py` | `POST /warmup` |
| `backend/app/routes/verification.py` | `POST /verify`, `POST /verify-batch` |

Routes are registered in `backend/app/main.py`.

## `GET /health`

Handler: `health_check`

Returns:

```json
{
  "status": "ok",
  "service": "alcohol-label-verification-api"
}
```

The `service` value comes from `Settings.service_name`.

## `POST /warmup`

Handler: `warmup`

Calls `warm_verification_dependencies()` and returns:

```json
{
  "status": "ok"
}
```

Warmup initializes reusable backend dependencies when a provider key exists. It can make one best-effort model metadata request per model per backend process to warm the provider network path. It does not upload files, send provider request content, or make an extraction request.

## `POST /verify`

Handler: `verify_label`

Accepts multipart form data:

- `file`
- `brand_name`
- `class_type`
- `alcohol_content`
- `net_contents`
- `bottler_producer`
- `country_of_origin`
- `government_warning`

Returns `SingleVerificationResponse`.

Known errors are mapped to HTTP status codes in the route handler. Daily verification cap exhaustion returns HTTP `429` with rate-limit headers.

## `POST /verify-batch`

Handler: `verify_batch`

Accepts multipart form data:

- `files`
- `brand_name`
- `class_type`
- `alcohol_content`
- `net_contents`
- `bottler_producer`
- `country_of_origin`
- `government_warning`

Returns `BatchVerificationResponse`.

Batch-level validation errors return HTTP `400`. Daily verification cap exhaustion returns request-level HTTP `429` before per-file processing. Per-file processing errors are returned inside result items.

## Government Warning Input

The route accepts the `government_warning` form field for API compatibility. `_build_expected_fields` ignores the submitted value and uses `STANDARD_GOVERNMENT_WARNING` from `backend/app/constants.py`.
