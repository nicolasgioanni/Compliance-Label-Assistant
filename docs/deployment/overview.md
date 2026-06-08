# Deployment Overview

## Current Deployment Model

The repository is intended for:

- Frontend: Vercel static frontend deployment from `frontend/`.
- Backend: Render Starter web service deployment from `backend/`.

No deployment platform config files are checked in:

- No `vercel.json`
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

## Related Docs

- [Frontend on Vercel](frontend-vercel.md)
- [Backend on Render](backend-render.md)
- [Deployment environment variables](environment-variables.md)
- [Production checklist](production-checklist.md)
