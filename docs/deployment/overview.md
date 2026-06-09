# Deployment Overview

## Current Deployment Model

The repository is intended for:

- Frontend: Vercel static frontend deployment from `frontend/`.
- Backend: Render Starter web service deployment from `backend/`.

Deployment config files:

- `frontend/vercel.json` is checked in for lightweight static response headers.
- No `render.yaml`
- No `Dockerfile`
- No `docker-compose.yml`
- No `Procfile`

Use deployment dashboard settings described in this section.

## Frontend To Backend Connection

The deployed frontend calls the deployed backend through:

```text
VITE_API_BASE_URL=<BACKEND_URL>
```

The deployed backend must allow the deployed frontend origin through:

```text
ALLOWED_ORIGINS=<FRONTEND_URL>
```

## Secrets

Only the backend needs provider secrets. Do not configure `OPENAI_API_KEY` in Vercel or any frontend runtime.

## Security Configuration

- Set backend `ALLOWED_ORIGINS` to the deployed Vercel origin.
- Keep `OPENAI_API_KEY` only in Render backend environment settings.
- Confirm Vercel `VITE_API_BASE_URL` points to the Render backend URL.
- Do not deploy this prototype to restricted government networks without review of PII, retention, audit logging, network egress, approved OCR or vision provider usage, access control, monitoring, and rate limiting.

## Related Docs

- [Frontend on Vercel](frontend-vercel.md)
- [Backend on Render](backend-render.md)
- [Deployment environment variables](environment-variables.md)
- [Production checklist](production-checklist.md)
