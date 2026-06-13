# Deployment Overview

## Current Deployment Model

The repository is intended for:

- Frontend: Vercel static frontend deployment from `frontend/`.
- Backend: Render Starter web service deployment from `backend/`.

Deployment config files:

- `frontend/vercel.json` is checked in for lightweight static response headers.
- No `render.yaml` is checked in yet; Render remains dashboard-configured.
- No `Dockerfile`
- No `docker-compose.yml`
- No `Procfile`

Use deployment dashboard settings described in this section.

## Validation Gate

GitHub Actions runs three required checks on pull requests to `main` and pushes to `main`:

- `backend-ci`
- `frontend-ci`
- `repo-hygiene`

The workflows do not deploy and do not require provider or deployment secrets. Configure GitHub branch protection so all three checks pass before merging to `main`, then let Vercel and Render deploy from validated protected `main` commits.

Branch protection, required status checks, required review, direct-push restrictions, Vercel production promotion, and Render auto-deploy behavior are dashboard settings. They cannot be fully enforced by repository workflow files alone.

Vercel should use `main` as the production branch with `frontend/` as the root, `npm run build`, `dist` output, and `VITE_API_BASE_URL` set to the Render backend URL. Render should use `backend/` as the root, `pip install -r requirements.txt`, `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, `/health` when a health check path is available, and dashboard-managed backend environment variables.

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
