# Backend On Render

## Service Settings

| Setting | Value |
| --- | --- |
| Service type | Web service |
| Runtime | Python |
| Root directory | `backend` |
| Build command | `pip install -r requirements.txt` |
| Start command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Python version | `python-3.11.9` from `backend/runtime.txt` |

`backend/start.sh` is also available and runs Uvicorn with `${PORT:-8000}`.

## Required Environment Variables

Minimum production variables:

- `OPENAI_API_KEY`
- `ALLOWED_ORIGINS`

Recommended explicit variables:

- `OPENAI_MODEL`
- `OPENAI_TIMEOUT_SECONDS`
- `OPENAI_IMAGE_DETAIL`
- `OPENAI_MAX_RETRIES`
- `OPENAI_EXTRACTION_CONCURRENCY`
- `MAX_FILE_SIZE_MB`
- `MAX_IMAGE_PIXELS`
- `MAX_BATCH_SIZE`
- `BATCH_CONCURRENCY`
- `MAX_IMAGE_WIDTH`
- `JPEG_QUALITY`

See [deployment environment variables](environment-variables.md).

## Port Behavior

Render provides `$PORT`. The start command must bind to `0.0.0.0` and use `$PORT`.

## CORS

Set:

```text
ALLOWED_ORIGINS=<FRONTEND_URL>
```

For multiple origins, use a comma-separated list.

## Upload Constraints

The backend enforces:

- file size through `MAX_FILE_SIZE_MB`
- decoded pixel count through `MAX_IMAGE_PIXELS`
- supported decoded formats through Pillow validation
- batch size through `MAX_BATCH_SIZE`

## Timeout And Performance Notes

- Provider timeout defaults to 10 seconds and is bounded from 2 to 30.
- Provider image detail defaults to `low`.
- Image preprocessing reduces request payload size before extraction.
- Increasing quality, width, detail, retries, or concurrency can increase latency or provider usage.

## Common Failures

Backend fails to start:

- Check build command and dependency installation.
- Check start command target `app.main:app`.
- Check service root is `backend`.

Provider configuration error:

- Check `OPENAI_API_KEY` exists in Render environment settings.
- Do not print or paste the real key into docs or logs.

CORS error:

- Check `ALLOWED_ORIGINS` includes the deployed frontend origin.

Upload errors:

- Check file format, file size, and decoded pixel count.

## Production Checklist

- Backend root directory is `backend`.
- Build command installs `requirements.txt`.
- Start command binds to `$PORT`.
- `OPENAI_API_KEY` is configured as a backend secret.
- `ALLOWED_ORIGINS` includes the deployed Vercel origin.
- File, image, batch, and provider settings are intentionally chosen.
- Backend pytest, ruff, and import check pass locally.
