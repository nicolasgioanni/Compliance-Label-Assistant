# Testing And Validation

## Backend Commands

From `backend/`:

```powershell
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m ruff check app
.\.venv\Scripts\python.exe -c "from app.main import app; print(app.title)"
```

Expected import-check output:

```text
Compliance Label Assistant API
```

## Frontend Commands

From `frontend/`:

```powershell
npm run lint
npm run typecheck
npm test
npm run test:watch
npm run build
npm run preview
```

## Continuous Integration

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`. It has separate `Backend` and `Frontend` jobs, does not deploy, and does not require `OPENAI_API_KEY`, Vercel credentials, or Render credentials.

The `Backend` job runs from `backend/`:

```text
python -m pytest
python -m ruff check app
python -c "from app.main import app; print(app.title)"
```

The `Frontend` job runs from `frontend/`:

```text
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

`npm test` is CI-safe because it maps to `vitest run`.

## Full-Stack Local Validation

1. Run `.\scripts\setup-local.ps1`.
2. Configure `backend/.env` with an `OPENAI_API_KEY` placeholder value replaced by a real local backend secret.
3. Start both services with `.\scripts\start-dev.ps1`.
4. Open `http://localhost:5173`.
5. Confirm backend health is shown as online.
6. Upload a supported image.
7. Try an unsupported image and confirm user-facing rejection.
8. Enter expected data for the selected label.
9. Run selected-label verification.
10. Add multiple ready labels and run ready-label verification.
11. Confirm results render in the selected label workspace.
12. Export CSV and Excel results.
13. Stop services with `Ctrl+C`.

## Manual Smoke Test Checklist

- Backend starts without import errors.
- Frontend starts and loads.
- `/health` returns `{"status":"ok"}`.
- Upload accepts JPG, PNG, WebP, or TIFF.
- Upload rejects unsupported type or oversized file.
- Selected-label verification calls `/verify`.
- Ready-label verification calls `/verify` once per ready item.
- Result summary counts update.
- Field cards show expected, observed, reason, and confidence.
- Export skips unverified and stale queue items.
- CORS settings match the active frontend origin.

## Missing Commands

- No backend typecheck command is configured.
- No frontend coverage command is configured.
- No backend coverage command is configured.
