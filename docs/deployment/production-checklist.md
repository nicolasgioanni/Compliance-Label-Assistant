# Production Checklist

## Before Deployment

- Run backend tests and ruff.
- Run backend import/startup validation.
- Run frontend lint, typecheck, tests, and build.
- Confirm `backend/.env` and `frontend/.env` are not committed.
- Confirm docs and examples use placeholders only.

## Vercel Frontend

- Root directory is `frontend`.
- Build command is `npm run build`.
- Output directory is `dist`.
- `VITE_API_BASE_URL` is set to `<BACKEND_URL>`.
- No provider secret is configured in Vercel.
- Static security headers from `frontend/vercel.json` are present.

## Render Backend

- Root directory is `backend`.
- Runtime is Python 3.11.
- Build command is `pip install -r requirements.txt`.
- Start command is `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- `OPENAI_API_KEY` is configured as a secret.
- `ALLOWED_ORIGINS` includes `<FRONTEND_URL>`.
- Upload and provider settings are intentionally selected.

## Smoke Test

After deployment:

1. Open the deployed frontend.
2. Confirm no startup error banner appears.
3. Confirm backend health is reachable through the frontend.
4. Upload a supported image.
5. Try an unsupported file and verify user-facing rejection.
6. Enter expected data and run verification.
7. Review field results and extracted fields.
8. Export verified results.
9. Confirm no secret values appear in browser output or logs.

## Known Deployment Gaps

- No checked-in Render config.
- No checked-in CI workflow.
- No deployment health monitor configuration documented in code.
