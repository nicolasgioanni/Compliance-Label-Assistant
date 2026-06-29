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

No `render.yaml` is currently checked in. Render service settings are expected to be configured in the Render dashboard unless the team later chooses to make service configuration reviewable in repository changes.

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
- `OPENAI_MAX_OUTPUT_TOKENS`
- `OPENAI_NETWORK_WARMUP`
- `OPENAI_WARMUP_TIMEOUT_SECONDS`
- `VERIFICATION_RATE_LIMIT_ENABLED`
- `VERIFICATION_DAILY_UNIT_LIMIT`
- `VERIFICATION_RATE_LIMIT_WINDOW_SECONDS`
- `MAX_FILE_SIZE_MB`
- `MAX_IMAGE_PIXELS`
- `MAX_BATCH_SIZE`
- `BATCH_CONCURRENCY`
- `MAX_IMAGE_WIDTH`
- `JPEG_QUALITY`

See [deployment environment variables](environment-variables.md).

## Port Behavior

Render provides `$PORT`. The start command binds to `0.0.0.0` and uses `$PORT`.

## Deploy Gate

Render auto-deploy from `main` is intended only after GitHub branch protection is active and requires `backend-ci`, `frontend-ci`, and `repo-hygiene`. Render dashboard deploy-after-checks or deployment protection can provide an additional production-service guard when available.

When Render supports an explicit health check path for the service, the path is `/health`.

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
- Provider output is capped by `OPENAI_MAX_OUTPUT_TOKENS`.
- Verification requests are capped by the in-memory daily verification unit limit.
- Image preprocessing reduces request payload size before extraction.
- Increasing quality, width, detail, retries, or concurrency can increase latency or provider usage.

## Common Failures

Backend fails to start:

- Check build command and dependency installation.
- Check start command target `app.main:app`.
- Check service root is `backend`.

Provider configuration error:

- Check `OPENAI_API_KEY` exists in Render environment settings.
- Docs and logs use placeholders rather than the real key.

CORS error:

- Check `ALLOWED_ORIGINS` includes the deployed frontend origin.
- Deployed environments use explicit origins rather than wildcard origins.

Upload errors:

- Check file format, file size, and decoded pixel count.

## Production Checklist

- Backend root directory is `backend`.
- Build command installs `requirements.txt`.
- Start command binds to `$PORT`.
- Health check path is `/health` if Render exposes health check configuration.
- `OPENAI_API_KEY` is configured as a backend secret.
- `ALLOWED_ORIGINS` includes the deployed Vercel origin.
- File, image, batch, provider, and daily verification cap settings are intentionally chosen.
- OpenAI project budgets are configured as secondary billing alerts.
- API responses include lightweight defensive headers.
- Backend pytest with coverage, Ruff, and import check pass locally.
- GitHub required checks `backend-ci`, `frontend-ci`, and `repo-hygiene` pass on the commit being deployed.
