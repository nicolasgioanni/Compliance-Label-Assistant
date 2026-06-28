# Compliance Label Assistant

Compliance Label Assistant is a standalone alcohol label verification prototype. It compares uploaded label artwork with expected application fields, shows field-level differences, and helps reviewers identify labels that look correct, mismatched, or in need of manual review.

This is an independent prototype. It is not an official TTB, Treasury, or government system, and it does not make final legal compliance decisions.

## Deployed Application

| Target | URL |
| --- | --- |
| Landing page | https://compliance-label-assistant.vercel.app |
| Verification tool | https://compliance-label-assistant.vercel.app/app |
| About page | https://compliance-label-assistant.vercel.app/about |
| Privacy Policy | https://compliance-label-assistant.vercel.app/privacy |
| Terms of Use | https://compliance-label-assistant.vercel.app/terms |
| Backend API | https://compliance-label-assistant.onrender.com |
| Source repository | https://github.com/nicolasgioanni/label-compliance-verifier |

These are public application URLs. Do not add private dashboard links, credentials, tokens, or real environment values to documentation.

## What The App Does

- Accepts JPG, PNG, WebP, or TIFF label images.
- Lets a reviewer enter expected values for brand name, class or type, alcohol content, net contents, bottler/producer, and country of origin.
- Applies the standard government warning text automatically.
- Sends each verified label to the backend for extraction and deterministic comparison.
- Shows field-level statuses, extracted values, reasons, confidence values, and timing details.
- Supports a frontend queue of up to 10 labels.
- Exports current non-stale verification results to CSV or XLSX.
- Provides prototype transparency pages for privacy, terms, AI use, and human-review boundaries.

The current frontend calls `GET /health`, `POST /warmup`, and `POST /verify`. The backend also exposes `POST /verify-batch`, but the current frontend does not call it.

## Architecture At A Glance

- Frontend: React 18 and Vite in `frontend/`.
- Backend: FastAPI in `backend/`.
- API client: `frontend/src/api/verificationApi.js`.
- Backend entrypoint: `backend/app/main.py`.
- Backend config: `backend/app/config.py`.
- Provider boundary: `backend/app/providers/openai/`.
- Image handling: `backend/app/image_processing/`.
- Verification rules: `backend/app/verification/`.
- Deployment: Vercel frontend and Render backend.
- CI: split GitHub Actions workflows for backend, frontend, and repository hygiene.

Deep technical documentation lives in [docs/](docs/README.md).

## Quick Start

Prerequisites:

- Git
- Node.js compatible with the frontend Vite toolchain
- Python 3.11
- PowerShell on Windows for repository helper scripts

```powershell
git clone <repository-url>
cd label-compliance-verifier
.\scripts\setup-local.ps1
```

Add a backend provider key to ignored `backend/.env`:

```text
OPENAI_API_KEY=<OPENAI_API_KEY>
```

Start both services:

```powershell
.\scripts\start-dev.ps1
```

Local URLs:

- Frontend landing page: `http://localhost:5173`
- Frontend verification tool: `http://localhost:5173/app`
- Backend API: `http://127.0.0.1:8000`
- Health check: `http://127.0.0.1:8000/health`

## Common Commands

Frontend commands from `frontend/`:

```powershell
npm run lint
npm run typecheck
npm test
npm run test:coverage -- --run
npm run build
```

Backend commands from `backend/`:

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

## Testing Overview

The repository uses focused automated checks rather than live provider calls in CI. Backend tests cover API contracts, upload validation, image preprocessing, provider error mapping, deterministic verification rules, rate limiting, batch behavior, CORS, and warmup behavior. Frontend tests cover the app shell, queue workflow, upload handling, expected-field utilities, result navigation, export behavior, browser support, and status resolution.

GitHub Actions runs separate backend, frontend, and repository hygiene workflows on pull requests and pushes to `main`. See [testing and validation](docs/development/testing-and-validation.md) for the full command matrix and manual smoke checklist.

## Environment Variables

Frontend:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend API base URL used by browser requests. Defaults to `http://localhost:8000` in frontend code. |

Backend:

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Backend-only provider key required for extraction-backed verification. |
| `ALLOWED_ORIGINS` | Comma-separated browser origins allowed by CORS. |
| `VERIFICATION_DAILY_UNIT_LIMIT` | Daily global verification unit cap; default is 50. |

Additional backend tuning variables are documented in [backend environment variables](docs/backend/environment-variables.md) and [deployment environment variables](docs/deployment/environment-variables.md). Never commit real `.env` values.

## Deployment Overview

- Vercel should use `frontend/` as the project root, `npm run build` as the build command, and `dist` as the output directory.
- Vercel needs `VITE_API_BASE_URL=<BACKEND_URL>` for deployed browser requests.
- Render should use `backend/` as the service root, Python `3.11.9`, installed dependencies from `backend/requirements.txt`, and the Uvicorn start command documented in deployment docs.
- Render provides `PORT`; `backend/start.sh` runs Uvicorn with `${PORT:-8000}`.
- Provider secrets belong only in the backend deployment environment.

See [deployment overview](docs/deployment/overview.md), [frontend on Vercel](docs/deployment/frontend-vercel.md), and [backend on Render](docs/deployment/backend-render.md).

## Documentation Map

- [Reviewer guide](REVIEWER_GUIDE.md)
- [Documentation index](docs/README.md)
- [Architecture overview](docs/architecture/system-overview.md)
- [Frontend overview](docs/frontend/overview.md)
- [Backend overview](docs/backend/overview.md)
- [API overview](docs/api/overview.md)
- [Local development](docs/development/local-development.md)
- [Testing and validation](docs/development/testing-and-validation.md)
- [Troubleshooting](docs/development/troubleshooting.md)
- [Security and privacy](docs/security.md)
- [Performance and cost](docs/architecture/performance-and-cost.md)
- [Repository map](docs/reference/repository-map.md)
- [Known gaps](docs/maintenance/known-gaps.md)
- [Sample label fixtures](sample-data/README.md)

## Security Reminder

- Keep `OPENAI_API_KEY` backend-only.
- Do not put provider keys in frontend code or Vercel frontend variables.
- Do not commit `backend/.env`, `frontend/.env`, real tokens, private dashboard URLs, uploaded payloads, or sensitive operational details.
- Uploaded files are validated and processed temporarily by application code; they are not persistently stored by this prototype.

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE).
