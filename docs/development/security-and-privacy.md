# Security And Privacy

## Secret Handling

- Keep `OPENAI_API_KEY` backend-only.
- Configure backend secrets in `backend/.env` locally and Render environment settings in deployment.
- Do not configure provider keys in Vercel, frontend env files, frontend code, docs, logs, screenshots, or examples.
- Use placeholders such as `<OPENAI_API_KEY>`, `<BACKEND_URL>`, and `<FRONTEND_URL>`.

## Environment Files

Ignored local files:

- `backend/.env`
- `frontend/.env`

Tracked examples:

- `backend/.env.example`
- `frontend/.env.example`

Example files must contain placeholders or safe defaults only.

## Upload Handling

Current backend behavior:

- Reads uploaded files into memory for validation.
- Validates extension, MIME type, decoded image format, file size, readability, and decoded pixel count.
- Converts Pillow openability and decompression-bomb failures into clean user-facing errors.
- Preprocesses image bytes in memory.
- Does not persist uploaded files.

Do not add persistent upload storage without explicit retention and privacy requirements.

## Logging

Do not log:

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

Production should use explicit frontend origins, not `*`.

## Browser And Export Safety

- Extracted text and user-entered values are rendered through React text nodes, not HTML injection.
- CSV export neutralizes formula-like cell prefixes before download.
- CSV export omits raw extracted text.
- Vercel static responses use lightweight headers from `frontend/vercel.json`.
- Backend API responses include lightweight defensive headers from `backend/app/utils/security_headers.py`.

## Error Responses

Return safe user-facing error messages. Do not return stack traces, provider secrets, raw provider payloads, or sensitive configuration values.

## Git Hygiene

Before committing:

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
- production rate limiting
- production monitoring

These are not current features and should not be claimed in docs or user interface copy.
