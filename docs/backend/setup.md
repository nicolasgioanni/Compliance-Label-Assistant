# Backend Setup

## Location

`backend/`

## Recommended Setup

From the repository root:

```powershell
.\scripts\setup-local.ps1
```

This creates `backend/.venv` when needed and installs `backend/requirements.txt` when dependencies are missing or outdated.

## Manual Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Run

Recommended full-stack startup:

```powershell
.\scripts\start-dev.ps1
```

Backend-only startup:

```powershell
.\scripts\start-backend.ps1
```

Manual backend startup:

```powershell
cd backend
$env:OPENAI_API_KEY="<OPENAI_API_KEY>"
$env:ALLOWED_ORIGINS="<FRONTEND_URL>"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Startup Validation

```powershell
cd backend
.\.venv\Scripts\python.exe -c "from app.main import app; print(app.title)"
```

Expected title:

```text
Compliance Label Assistant API
```

## Production Startup

Render start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

`backend/start.sh` runs the same target with `${PORT:-8000}`.
