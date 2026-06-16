# Security

## Current Posture

Compliance Label Assistant is a lightweight prototype, not a production security baseline. The implemented controls focus on protecting provider secrets, rejecting invalid uploads, avoiding persistent uploaded image storage, rendering browser text safely, and limiting accidental cost or abuse.

## Secrets And Provider Boundary

- `OPENAI_API_KEY` is read only by backend configuration in `backend/app/config.py`.
- The frontend uses only `VITE_API_BASE_URL` and never calls OpenAI directly.
- Provider-specific extraction code is isolated under `backend/app/providers/openai/`, so the extraction layer can later be replaced by an approved OCR or AI provider.
- `.env` files are ignored; committed examples use placeholders or safe defaults only.
- Vercel frontend configuration must not receive provider secrets.
- Render backend configuration owns provider secrets such as `OPENAI_API_KEY`.

## Upload And Data Handling

- The backend validates file extension, MIME type, decoded image format, non-empty content, byte size, readability, and decoded pixel count.
- Supported upload formats are JPG/JPEG, PNG, WebP, and TIFF/TIF images.
- Pillow image errors, including decompression-bomb style failures, are converted to clean user-facing upload or preprocessing errors.
- Uploaded images are read and preprocessed in memory. The application code does not persist uploaded files to disk or a database.
- Filenames are used only for display and result context. They are not used for filesystem writes.

## Browser And API Boundaries

- Backend CORS uses `ALLOWED_ORIGINS`; deployed Render configuration must include the deployed Vercel origin and should not use a wildcard origin.
- Backend API responses include lightweight defensive headers: `X-Content-Type-Options`, `Referrer-Policy`, and `Cache-Control`.
- The Vercel frontend config adds static security headers without a content security policy because the backend API origin is deployment-specific.
- React renders extracted text and user-entered values as text, not HTML.
- CSV export neutralizes formula-like cell prefixes and does not export raw extracted text.
- XLSX export includes the same result summary rows as CSV.

## Error Handling And Logging

- Known upload, preprocessing, provider configuration, provider response, and provider service errors are mapped to user-facing API responses.
- Unexpected backend errors return a generic message.
- Do not log provider keys, tokens, raw image bytes, base64 image payloads, full uploaded payloads, full environment dumps, or real local `.env` contents.

## Abuse And Cost Controls

- Frontend queue size is limited to 10 files.
- Frontend ready-label verification uses bounded concurrency.
- Backend upload size, decoded pixel count, batch size, provider timeout, provider concurrency, and batch concurrency are configurable.
- The prototype does not implement authentication, authorization, user-level rate limiting, or account-based quotas.

## Prototype Omissions

The current prototype does not include:

- Authentication
- Authorization
- Database persistence
- Audit logging
- Persistent upload storage
- Document retention workflow
- Malware scanning
- Production monitoring
- Long-running background batch infrastructure

## Production Considerations

Production government deployment would require additional review before handling sensitive applicant data. Important areas include personally identifiable information handling, retention policy, audit logging, access control, network egress, approved OCR or AI infrastructure, monitoring, alerting, rate limiting, and incident response.

External ML endpoints may not be allowed in restricted government networks without approval. The current OpenAI integration should be treated as a prototype extraction provider boundary, not as a final production infrastructure decision.

Related documentation:

- [Development Security And Privacy](development/security-and-privacy.md)
- [Backend Logging And Errors](backend/logging-and-errors.md)
- [API Error Responses](api/error-responses.md)
