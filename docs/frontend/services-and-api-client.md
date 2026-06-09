# Services And API Client

## API Client Location

`frontend/src/api/verificationApi.js`

This is the only endpoint-aware frontend module.

## Configuration

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

The frontend should never receive provider secrets.

## Exports

| Export | Backend endpoint | Purpose |
| --- | --- | --- |
| `checkHealth()` | `GET /health` | Loads backend health status for the app shell. |
| `warmVerificationBackend()` | `POST /warmup` | Initializes reusable backend dependencies without uploading a file. |
| `verifySingleLabel(file, expectedFields)` | `POST /verify` | Sends one queued file and expected fields for backend verification. |

## Request Construction

`verifySingleLabel` builds `FormData` with:

- `file`
- `brand_name`
- `class_type`
- `alcohol_content`
- `net_contents`
- `bottler_producer`
- `country_of_origin`
- `government_warning`

Frontend expected field names are camelCase. API form field names are snake_case. `appendExpectedFields` performs that mapping.

If `expectedFields.governmentWarning` is empty, the client appends `DEFAULT_GOVERNMENT_WARNING`. The backend still verifies against its server-owned standard warning.

## Response Parsing

`parseApiResponse`:

- Attempts `response.json()`.
- Throws `Error(body.detail)` for non-OK responses when `detail` exists.
- Throws `Error('The verification service returned an error.')` for non-OK responses without a JSON detail.
- Returns the parsed body for OK responses.

## Updating API Calls Safely

1. Update backend route and schema docs first or in the same change.
2. Keep all endpoint URLs in `verificationApi.js`.
3. Keep form field names aligned with `backend/app/routes/verification.py`.
4. Add frontend tests for request behavior if the payload shape changes.
5. Add backend API contract tests if request or response fields change.
