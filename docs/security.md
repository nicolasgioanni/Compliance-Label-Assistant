# Security

## Current Posture

Compliance Label Assistant is a lightweight prototype, not a production security baseline. The implemented controls focus on protecting provider secrets, rejecting unsafe uploads, avoiding persistent uploaded file storage, keeping browser rendering safe, and limiting accidental cost or abuse.

## Secrets And Provider Boundary

- `OPENAI_API_KEY` is read only by backend configuration in `backend/app/config.py`.
- The frontend uses only `VITE_API_BASE_URL`; provider calls remain backend-only.
- Provider-specific extraction code is isolated under `backend/app/providers/openai`, so the extraction layer can later be replaced by an approved AI or OCR provider.
- `.env` files are ignored; committed examples contain placeholders or safe defaults only.
- Vercel frontend configuration does not receive provider secrets.
- Render backend configuration owns provider secrets such as `OPENAI_API_KEY`.

## Upload And Data Handling

- The backend validates file extension, MIME type, decoded image format, non-empty content, byte size, readability, and decoded pixel count.
- Pillow image errors, including decompression-bomb style failures, are converted to clean user-facing upload/preprocessing errors.
- Uploaded images are read and preprocessed in memory. The application code does not persist uploaded files to disk or a database.
- Filenames are used only for display/result context and are not used for filesystem writes.

## Browser And API Boundaries

- Backend CORS uses `ALLOWED_ORIGINS`; deployed Render configuration includes the deployed Vercel origin and uses explicit origins rather than a wildcard origin.
- Backend API responses include lightweight defensive headers: `X-Content-Type-Options`, `Referrer-Policy`, and `Cache-Control`.
- The Vercel frontend config adds static security headers without a CSP, because the backend API origin is deployment-specific.
- React renders extracted text and user-entered values as text, not HTML.
- CSV export neutralizes formula-like cell prefixes and does not export raw extracted text.

## Logging And Repository Hygiene

Logging excludes provider keys, tokens, raw image bytes, base64 image payloads, full uploaded payloads, full environment dumps, and real local `.env` contents. Current unexpected-error logging records exception class names rather than stack traces or payloads.

Repository hygiene checks cover ignored env files, generated outputs, logs, private dashboard URLs, credentials, and raw uploaded payloads.

## Abuse And Cost Controls

- Frontend queue size is limited to 10 files for user experience and call-count control.
- Backend upload size, decoded pixel count, batch size, provider timeout, provider concurrency, and batch concurrency are configurable.
- Backend verification requests are capped by a process-local in-memory daily verification-unit limit. The default is 50 units per 24-hour window across all users, where one label image costs one unit.
- Provider responses are capped with `OPENAI_MAX_OUTPUT_TOKENS`.
- Configure OpenAI project budgets as secondary billing alerts; app-level limiting remains the primary hard guard in this prototype.
- A complex authentication or distributed rate-limit system is not implemented in this prototype.

## Production Limitations

The prototype does not include authentication, authorization, a database, audit logging, persistent upload storage, malware scanning, production monitoring, distributed rate limiting, or long-running batch infrastructure.

Production government deployment would need review for PII handling, retention, audit logging, network egress, approved OCR or vision provider usage, access control, monitoring, and distributed rate limiting. A cloud AI provider may not be allowed in restricted government networks.

Related documentation:

- [Development Security And Privacy](development/security-and-privacy.md)
- [Backend Logging And Errors](backend/logging-and-errors.md)
- [API Error Responses](api/error-responses.md)
