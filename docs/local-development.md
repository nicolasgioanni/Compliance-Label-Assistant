# Local Development

This project is Windows PowerShell-first for local development. The backend is FastAPI, and the frontend is Vite. If you run the services manually, you need two terminals because both servers keep running. The `scripts/start-dev.ps1` launcher runs both in one terminal and stops both with `Ctrl+C`.

## First Run

From the repository root:

```powershell
.\scripts\setup-local.ps1
```

This does four things:

- Creates `backend/.venv` if it does not exist.
- Installs Python dependencies from `backend/requirements.txt` when the venv is missing, incomplete, or `requirements.txt` changed.
- Runs `npm install` when `frontend/node_modules` is missing.
- Copies `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env` when those local files are missing.

Then add the backend-only OpenAI key:

```powershell
notepad backend\.env
```

Set:

```text
OPENAI_API_KEY=your-openai-key
```

Do not put the OpenAI API key in `frontend/.env`, frontend code, or any committed file.

## Daily Run

Recommended one-terminal command:

```powershell
.\scripts\start-dev.ps1
```

On a normal daily run, this should skip Python package installation after it confirms `backend/.venv` is already up to date.

URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:8000`
- Health check: `http://127.0.0.1:8000/health`

Use `Ctrl+C` in the launcher terminal to stop both servers.

If setup is already done and you want the fastest startup:

```powershell
.\scripts\start-dev.ps1 -SkipSetup
```

## Running From Any Repo Subfolder

PowerShell resolves `.\scripts\start-dev.ps1` relative to your current directory. That exact command only works from the repository root.

If you are anywhere inside the repo and Git is available, run:

```powershell
& "$((git rev-parse --show-toplevel).Trim())\scripts\start-dev.ps1"
```

The scripts still find the repo root internally before running commands, so dependency installation and server startup happen from the correct backend and frontend folders.

## Individual Scripts

Setup only:

```powershell
.\scripts\setup-local.ps1
```

Backend only:

```powershell
.\scripts\start-backend.ps1
```

Frontend only:

```powershell
.\scripts\start-frontend.ps1
```

Manual backend and frontend runs need two separate terminals. The combined `start-dev.ps1` script is the one-terminal option.

## Parameters

All startup scripts support these parameters where applicable:

```powershell
.\scripts\start-dev.ps1 -BackendPort 8010 -FrontendPort 5174
.\scripts\start-dev.ps1 -SkipSetup
.\scripts\start-dev.ps1 -NoEnvFile
```

- `-BackendPort`: backend port, default `8000`.
- `-FrontendPort`: frontend port, default `5173`.
- `-SkipSetup`: skip dependency setup checks and start immediately.
- `-NoEnvFile`: do not create or load local `.env` files.

When ports change, the scripts set `VITE_API_BASE_URL` for the frontend process to match the selected backend URL and ensure `ALLOWED_ORIGINS` includes the selected frontend origin.

## Environment Files

The scripts may create ignored local files:

- `backend/.env`
- `frontend/.env`
- `backend/.venv`
- `frontend/node_modules`

`backend/.env` is loaded by the scripts without printing values. This is where `OPENAI_API_KEY` belongs.

`frontend/.env` should contain only frontend-safe values such as:

```text
VITE_API_BASE_URL=http://localhost:8000
```

## Troubleshooting

If PowerShell blocks script execution for the current terminal session:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Then rerun the script.

If Python is missing, install Python 3 and restart PowerShell so either `py` or `python` is available.

If Node or npm is missing, install Node.js LTS and restart PowerShell so `npm` is available.

If port `8000` or `5173` is already in use, choose another port:

```powershell
.\scripts\start-dev.ps1 -BackendPort 8010 -FrontendPort 5174
```

If label verification reports that `OPENAI_API_KEY` is missing, edit `backend/.env`, set the key, stop the backend, and start it again.

If dependencies change, rerun:

```powershell
.\scripts\setup-local.ps1
```

If a previous package install was cancelled, rerun `.\scripts\start-dev.ps1`. If the existing venv already satisfies `backend/requirements.txt`, the script records that and continues without reinstalling.

If only one service is needed, use `start-backend.ps1` or `start-frontend.ps1` instead of `start-dev.ps1`.
