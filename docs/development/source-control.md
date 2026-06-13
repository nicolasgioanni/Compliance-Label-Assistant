# Source Control

## Current Repository Facts

- `.gitignore` excludes dependency folders, virtualenvs, caches, build output, logs, editor folders, and local env files.
- `.gitattributes` normalizes repository text files to LF and keeps PowerShell scripts CRLF.
- `.github/workflows/backend-ci.yml`, `.github/workflows/frontend-ci.yml`, and `.github/workflows/repo-hygiene.yml` run required validation on pull requests and pushes to `main`.
- No commit message convention is documented in the repository.

## Recommended Branch Workflow

Because no strict repository policy is documented in code, use this as a recommendation:

1. Create a short-lived branch for each change.
2. Keep frontend, backend, API, deployment, and docs changes scoped.
3. Run the validation commands relevant to changed areas.
4. Open a pull request with a concise summary and test results.
5. Configure branch protection on `main` to require the `backend-ci`, `frontend-ci`, and `repo-hygiene` checks before merging.
6. Update docs when behavior, commands, environment variables, or deployment settings change.

## Before Opening A Pull Request

Run when practical:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m pytest --cov=app --cov-report=term-missing --cov-report=xml
.\.venv\Scripts\python.exe -m ruff check app
.\.venv\Scripts\python.exe -c "from app.main import app; print(app.title)"
```

```powershell
cd frontend
npm run lint
npm run typecheck
npm test
npm run test:coverage -- --run
npm run build
```

## Secret Hygiene

Do not commit:

- `backend/.env`
- `frontend/.env`
- provider keys
- private dashboard URLs
- tokens
- raw uploaded images unless they are explicitly approved sample assets
- logs that may contain local paths or environment details

## Generated Files

Do not commit:

- `backend/.venv/`
- `frontend/node_modules/`
- `frontend/dist/`
- caches
- coverage output
- logs

Lockfiles:

- `frontend/package-lock.json` is tracked and should be updated when frontend dependencies change.

## API Contract Changes

When changing request or response fields:

- Update `backend/app/schemas.py`.
- Update route handlers and services.
- Update `frontend/src/api/verificationApi.js` if the frontend calls the changed contract.
- Update backend API contract tests.
- Update docs under `docs/api/` and affected frontend/backend docs.

## Releases

No release tagging process is documented in code. Needs confirmation before documenting a formal release process.
