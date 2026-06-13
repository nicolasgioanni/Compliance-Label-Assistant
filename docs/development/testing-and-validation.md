# Testing And Validation

## Backend Commands

From `backend/`:

```powershell
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m pytest --cov=app --cov-report=term-missing --cov-report=xml
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
npm run test:coverage -- --run
npm run test:watch
npm run build
npm run preview
```

## Continuous Integration

GitHub Actions is split into required validation workflows that run on pull requests to `main` and pushes to `main`. They do not deploy and do not require `OPENAI_API_KEY`, Vercel credentials, Render credentials, or provider secrets.

`.github/workflows/backend-ci.yml` exposes the required `backend-ci` check and runs from `backend/`:

```text
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m pytest --cov=app --cov-report=term-missing --cov-report=xml
python -m ruff check app
python -c "from app.main import app; print(app.title)"
```

`.github/workflows/frontend-ci.yml` exposes the required `frontend-ci` check and runs from `frontend/`:

```text
npm ci
npm run lint
npm run typecheck
npm run test:coverage -- --run
npm run build
```

`.github/workflows/repo-hygiene.yml` exposes the required `repo-hygiene` check and runs repository-level safeguards:

```text
git diff --check
tracked generated artifact check
secret-looking string check
skipped-test check
informational task-marker report
internal reference guard
```

Configure GitHub branch protection to require `backend-ci`, `frontend-ci`, and `repo-hygiene` before merging to `main`. Keep Vercel and Render deployment secrets out of test workflows.

## Latest Local Validation Snapshot

For implementation work that touches validation, run the backend, frontend, and repo hygiene commands above and record the actual result in the pull request notes. Do not treat older test-count snapshots as current once tests or workflow files change.

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
- No Playwright or Cypress browser smoke command is configured.
- Coverage thresholds are not enforced yet; baseline coverage should be reviewed before adding conservative thresholds.
- No GitHub Actions-controlled deployment command is configured.
