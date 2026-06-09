# API Overview

## Base URL

Local backend:

```text
http://127.0.0.1:8000
```

The frontend reads the deployed or local backend URL from `VITE_API_BASE_URL`.

## Endpoints

| Method | Path | Purpose | Frontend caller |
| --- | --- | --- | --- |
| `GET` | `/health` | Check backend availability. | `checkHealth` |
| `POST` | `/warmup` | Best-effort backend dependency initialization. | `warmVerificationBackend` |
| `POST` | `/verify` | Verify one label image against expected fields. | `verifySingleLabel` |
| `POST` | `/verify-batch` | Verify 2 to `MAX_BATCH_SIZE` label images with one shared expected field set. | Not called by current frontend |

## Content Types

- `/health`: no request body.
- `/warmup`: no request body.
- `/verify`: `multipart/form-data`.
- `/verify-batch`: `multipart/form-data`.

## Response Models

Defined in `backend/app/schemas.py`:

- `ExpectedFields`
- `ExtractedFields`
- `FieldResult`
- `SingleVerificationResponse`
- `BatchVerificationResponse`

## Status Values

Field statuses:

- `pass`
- `normalized_match`
- `fail`
- `missing`
- `needs_review`
- `error`

Overall statuses:

- `pass`
- `fail`
- `needs_review`
- `error`

## Error Shape

Request-level errors return:

```json
{
  "detail": "User-facing error message."
}
```

## Response Headers

Backend responses include lightweight defensive headers:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Cache-Control: no-store`
