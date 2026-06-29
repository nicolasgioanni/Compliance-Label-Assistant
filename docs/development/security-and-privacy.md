# Security And Privacy

## Secret Handling

- `OPENAI_API_KEY` remains backend-only.
- Configure backend secrets in `backend/.env` locally and Render environment settings in deployment.
- Provider keys remain outside Vercel, frontend env files, frontend code, docs, logs, screenshots, and examples.
- Placeholder values such as `<OPENAI_API_KEY>`, `<BACKEND_URL>`, and `<FRONTEND_URL>` document required configuration.

## Environment Files

Ignored local files:

- `backend/.env`
- `frontend/.env`

Tracked examples:

- `backend/.env.example`
- `frontend/.env.example`

Example files contain placeholders or safe defaults only.

## Upload Handling

Current backend behavior:

- Reads uploaded files into memory for validation.
- Validates extension, MIME type, decoded image format, file size, readability, and decoded pixel count.
- Converts Pillow openability and decompression-bomb failures into clean user-facing errors.
- Preprocesses image bytes in memory.
- Does not persist uploaded files.

Persistent upload storage remains out of scope unless retention and privacy requirements are explicitly defined.

## Logging

Logging excludes:

- provider keys
- tokens
- raw image bytes
- base64 image payloads
- full uploaded payloads
- full environment dumps
- real local `.env` contents

Current unexpected-error logging records only exception class names.

## CORS

Backend CORS is configured from `ALLOWED_ORIGINS`.

Production uses explicit frontend origins rather than `*`.

## Browser And Export Safety

- Extracted text and user-entered values are rendered through React text nodes, not HTML injection.
- CSV export neutralizes formula-like cell prefixes before download.
- CSV export omits raw extracted text.
- Vercel static responses use lightweight headers from `frontend/vercel.json`.
- Backend API responses include lightweight defensive headers from `backend/app/utils/security_headers.py`.

## Error Responses

Error handling returns safe user-facing messages. Stack traces, provider secrets, raw provider payloads, and sensitive configuration values remain outside API responses.

## Git Hygiene

Repository hygiene checks include:

- Check `git status --short`.
- Confirm ignored env files are not staged.
- Confirm generated outputs and logs are not staged.
- Review docs and examples for real URLs or secrets.

## Not Implemented

The current prototype does not include:

- authentication
- authorization
- database persistence
- audit logs
- encrypted file storage
- malware scanning
- distributed production rate limiting
- production monitoring

These are not current features and remain outside documentation and user interface claims.
