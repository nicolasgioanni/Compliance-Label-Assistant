# Security

The prototype is designed around safe handling of uploaded files and backend-only secrets.

## Implemented Controls

- OpenAI API key is read only by the backend from `OPENAI_API_KEY`.
- Frontend uses only `VITE_API_BASE_URL` and never calls OpenAI directly.
- CORS origins are configured from `ALLOWED_ORIGINS`.
- Backend validates file extension, MIME type, empty files, file size, and Pillow image openability.
- Batch size is limited by `MAX_BATCH_SIZE`.
- Uploaded image bytes are processed in memory and are not written to permanent storage.
- Logging is minimal and should not include API keys, image bytes, full payloads, raw secrets, or full environment dumps.
- Unexpected backend exceptions return a generic JSON error instead of stack traces.

## Production Notes

- Set `ALLOWED_ORIGINS` to the deployed frontend origin, not `*`.
- Rotate and protect `OPENAI_API_KEY` through the deployment platform secret manager.
- Keep file and batch limits conservative for latency, cost, and abuse control.
- Add authentication only if the product scope expands beyond this MVP.
