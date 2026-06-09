# Setup And Run Guide

This guide is the evaluator-facing setup path for running the prototype locally.

## Prerequisites

- Git
- Node.js compatible with the Vite frontend toolchain
- Python 3.11
- PowerShell on Windows for the repository helper scripts
- Backend provider key configured as `OPENAI_API_KEY`

## Clone The Repository

```powershell
git clone <repository-url>
cd label-compliance-verifier
```

## Recommended Local Setup

From the repository root:

```powershell
.\scripts\setup-local.ps1
```

The setup script prepares backend and frontend dependencies and initializes local environment files from the checked-in examples unless `-NoEnvFile` is supplied.

Set the backend provider key in `backend\.env`:

```powershell
OPENAI_API_KEY=<OPENAI_API_KEY>
```

Start both services from the repository root:

```powershell
.\scripts\start-dev.ps1
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://127.0.0.1:8000`
- Health check: `http://127.0.0.1:8000/health`

## Manual Backend Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
$env:OPENAI_API_KEY="<OPENAI_API_KEY>"
$env:ALLOWED_ORIGINS="http://localhost:5173"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend entrypoint is `backend/app/main.py`, and the ASGI startup target is `app.main:app`.

## Manual Frontend Setup

In a separate terminal:

```powershell
cd frontend
npm install
$env:VITE_API_BASE_URL="http://127.0.0.1:8000"
npm run dev -- --host localhost --port 5173
```

The frontend entrypoint is `frontend/src/main.jsx`, and the app shell is `frontend/src/App.jsx`.

## Environment Variables

### Frontend

| Name | Required | Safe local value | Purpose |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Yes for deployed frontend; optional locally because a code default exists | `http://127.0.0.1:8000` | Backend API base URL used by `frontend/src/api/verificationApi.js`. |

The checked-in example is `frontend/.env.example`.

### Backend

| Name | Required | Safe local value | Purpose |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | Required for verification requests | `<OPENAI_API_KEY>` | Backend-only provider key. |
| `OPENAI_MODEL` | Optional | `gpt-4.1-mini` | Vision model used by the extraction provider. |
| `OPENAI_TIMEOUT_SECONDS` | Optional | `10` | Provider request timeout, bounded in backend config. |
| `OPENAI_IMAGE_DETAIL` | Optional | `low` | Provider image detail setting. |
| `OPENAI_MAX_RETRIES` | Optional | `0` | Provider retry count, bounded in backend config. |
| `OPENAI_EXTRACTION_CONCURRENCY` | Optional | `2` | Concurrency for provider extraction calls. |
| `OPENAI_NETWORK_WARMUP` | Optional | `true` | Enables non-generation provider metadata warmup. |
| `OPENAI_WARMUP_TIMEOUT_SECONDS` | Optional | `2` | Warmup metadata request timeout, bounded in backend config. |
| `MAX_FILE_SIZE_MB` | Optional | `5` | Backend upload size limit. |
| `MAX_IMAGE_PIXELS` | Optional | `25000000` | Backend image pixel limit. |
| `MAX_BATCH_SIZE` | Optional | `10` | Backend `/verify-batch` file count limit. |
| `BATCH_CONCURRENCY` | Optional | `3` | Backend batch processing concurrency. |
| `MAX_IMAGE_WIDTH` | Optional | `640` | Maximum preprocessed image width. |
| `JPEG_QUALITY` | Optional | `60` | JPEG encoding quality for preprocessed images. |
| `ALLOWED_ORIGINS` | Required when frontend origin differs from default | `http://localhost:5173` | Comma-separated CORS allowlist. |

The checked-in example is `backend/.env.example`. Do not commit local `.env` files with real values.

## Test Commands

Frontend:

```powershell
cd frontend
npm run lint
npm run typecheck
npm test
```

Backend:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m ruff check app
.\.venv\Scripts\python.exe -c "from app.main import app; print(app.title)"
```

## Build Commands

Frontend production build:

```powershell
cd frontend
npm run build
```

There is no checked-in backend build script. Render should install `backend/requirements.txt` and start Uvicorn with the command documented in [../deployment/backend-render.md](../deployment/backend-render.md).

## Smoke Test

1. Start the backend.
2. Start the frontend.
3. Open `http://localhost:5173`.
4. Confirm the backend status indicator is online.
5. Upload a valid JPG, PNG, WebP, or TIFF label image smaller than 5 MB.
6. Enter expected values for at least brand name and any other fields being evaluated.
7. Run verification for the selected label.
8. Review the overall status, field statuses, extracted values, and timing fields.
9. Queue multiple ready labels and run the ready-label workflow.
10. Export current results to CSV or XLSX.
11. Try an unsupported file type and confirm that a validation message appears.

For repeatable manual smoke tests, use the synthetic fixture matrix in [../../sample-data/README.md](../../sample-data/README.md).

## Common Setup Issues

| Symptom | Likely cause | Safe fix |
| --- | --- | --- |
| Frontend cannot reach backend | `VITE_API_BASE_URL` points to the wrong host or port | Set `VITE_API_BASE_URL=http://127.0.0.1:8000` and restart the frontend. |
| Backend status indicator is offline | Backend is not running or health check is blocked | Start the backend and open `http://127.0.0.1:8000/health`. |
| Verification returns provider configuration error | `OPENAI_API_KEY` is missing on the backend | Set `OPENAI_API_KEY=<OPENAI_API_KEY>` in `backend\.env` or the backend shell. |
| Browser reports CORS failure | Frontend origin is not in `ALLOWED_ORIGINS` | Set `ALLOWED_ORIGINS=http://localhost:5173` for local development. |
| Upload is rejected | File type, MIME type, extension, size, or dimensions are outside configured limits | Use a JPG, PNG, WebP, or TIFF image smaller than 5 MB. |
| Frontend script fails | Dependencies are missing | Run `npm install` in `frontend/` or rerun `.\scripts\setup-local.ps1`. |
| Backend command cannot find packages | Virtual environment is missing or dependencies are not installed | Run `python -m venv .venv` and `.\.venv\Scripts\python.exe -m pip install -r requirements.txt` in `backend/`. |
