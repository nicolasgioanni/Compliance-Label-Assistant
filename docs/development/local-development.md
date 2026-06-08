# Local Development

## Recommended Environment

This repository includes Windows PowerShell scripts for local setup and startup.

Required tools:

- Python 3
- Node.js and npm
- PowerShell

## First Run

From repository root:

```powershell
.\scripts\setup-local.ps1
```

The script:

- Finds the repository root.
- Creates `backend/.env` from `backend/.env.example` when missing.
- Creates `frontend/.env` from `frontend/.env.example` when missing.
- Creates `backend/.venv` when missing.
- Installs backend dependencies when needed.
- Installs frontend dependencies when `frontend/node_modules` is missing.

Then set a backend provider key in ignored `backend/.env`:

```text
OPENAI_API_KEY=<OPENAI_API_KEY>
```

## Daily Run

```powershell
.\scripts\start-dev.ps1
```

This starts:

- Backend: `http://127.0.0.1:8000`
- Frontend: `http://localhost:5173`

Stop both with `Ctrl+C`.

## Alternate Ports

```powershell
.\scripts\start-dev.ps1 -BackendPort 8010 -FrontendPort 5174
```

The scripts set process-level:

- `VITE_API_BASE_URL=http://127.0.0.1:<BackendPort>`
- `ALLOWED_ORIGINS` including `http://localhost:<FrontendPort>`

## Individual Scripts

```powershell
.\scripts\setup-local.ps1
.\scripts\start-backend.ps1
.\scripts\start-frontend.ps1
```

Common parameters:

- `-BackendPort`
- `-FrontendPort`
- `-SkipSetup`
- `-NoEnvFile`

## Manual Backend

```powershell
cd backend
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
$env:OPENAI_API_KEY="<OPENAI_API_KEY>"
$env:ALLOWED_ORIGINS="http://localhost:5173"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Manual Frontend

```powershell
cd frontend
npm install
$env:VITE_API_BASE_URL="http://127.0.0.1:8000"
npm run dev -- --host localhost --port 5173
```

## Running From A Subfolder

```powershell
& "$((git rev-parse --show-toplevel).Trim())\scripts\start-dev.ps1"
```

## Ignored Local Outputs

- `backend/.env`
- `frontend/.env`
- `backend/.venv/`
- `frontend/node_modules/`
- `frontend/dist/`
- cache folders
- log files
