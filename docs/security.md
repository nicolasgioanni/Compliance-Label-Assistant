# Security

## Current Posture

Compliance Label Assistant is a lightweight prototype, not a production security baseline. The implemented controls focus on protecting provider secrets, rejecting unsafe uploads, avoiding persistent uploaded file storage, keeping browser rendering safe, and limiting accidental cost or abuse.

## Secrets And Provider Boundary

- `OPENAI_API_KEY` is read only by backend configuration in `backend/app/config.py`.
- The frontend uses only `VITE_API_BASE_URL` and never calls OpenAI directly.
- Provider-specific extraction code is isolated under `backend/app/providers/openai`, so the extraction layer can later be replaced by an approved AI or OCR provider.
- `.env` files are ignored; committed examples must contain placeholders or safe defaults only.

## Upload And Data Handling

- The backend validates file extension, MIME type, decoded image format, non-empty content, byte size, readability, and decoded pixel count.
- Pillow image errors, including decompression-bomb style failures, are converted to clean user-facing upload/preprocessing errors.
- Uploaded images are read and preprocessed in memory. The application code does not persist uploaded files to disk or a database.
- Filenames are used only for display/result context and are not used for filesystem writes.

## Browser And API Boundaries

- Backend CORS uses `ALLOWED_ORIGINS`; deployed Render configuration must include the deployed Vercel origin and should not use a wildcard origin.
- Backend API responses include lightweight defensive headers: `X-Content-Type-Options`, `Referrer-Policy`, and `Cache-Control`.
- The Vercel frontend config adds static security headers without a CSP, because the backend API origin is deployment-specific.
- React renders extracted text and user-entered values as text, not HTML.
- CSV export neutralizes formula-like cell prefixes and does not export raw extracted text.

## Abuse And Cost Controls

- Frontend queue size is limited to 10 files for user experience and call-count control.
- Backend upload size, decoded pixel count, batch size, provider timeout, provider concurrency, and batch concurrency are configurable.
- A complex authentication or rate-limit system is not implemented in this prototype.

## Production Limitations

The prototype does not include authentication, authorization, a database, audit logging, persistent upload storage, malware scanning, production monitoring, or long-running batch infrastructure.

Production government deployment would need review for PII handling, retention, audit logging, network egress, approved OCR or vision provider usage, access control, monitoring, and rate limiting. A cloud AI provider may not be allowed in restricted government networks.

Related documentation:

- [Development Security And Privacy](development/security-and-privacy.md)
- [Backend Logging And Errors](backend/logging-and-errors.md)
- [API Error Responses](api/error-responses.md)
