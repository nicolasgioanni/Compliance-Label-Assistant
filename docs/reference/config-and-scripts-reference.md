# Config And Scripts Reference

## Root Config

| Path | Purpose |
| --- | --- |
| `.gitignore` | Excludes dependencies, env files, build outputs, caches, logs, and editor files. |
| `.gitattributes` | Normalizes line endings and marks image/PDF/Office files as binary. |
| `.github/workflows/backend-ci.yml` | Runs backend dependency install, pytest with coverage, Ruff, and app import validation on pull requests and pushes to `main`. |
| `.github/workflows/frontend-ci.yml` | Runs frontend install, lint, typecheck, Vitest with coverage, and production build validation on pull requests and pushes to `main`. |
| `.github/workflows/repo-hygiene.yml` | Runs repository hygiene checks for whitespace, generated artifacts, secret-looking values, skipped tests, and internal references. |
| `LICENSE` | Apache License 2.0. |

## Frontend Config

| Path | Purpose |
| --- | --- |
| `frontend/package.json` | Frontend package metadata, scripts, dependencies, browser targets. |
| `frontend/package-lock.json` | NPM lockfile; internals are not documented. |
| `frontend/vite.config.js` | Vite React plugin, build target, Vitest jsdom setup, and coverage reporter settings. |
| `frontend/eslint.config.js` | ESLint flat config for JS/JSX, React, hooks, tests, and config files. |
| `frontend/jsconfig.json` | JavaScript typecheck configuration used by `npm run typecheck`. |
| `frontend/postcss.config.cjs` | Autoprefixer PostCSS config. |
| `frontend/index.html` | Vite HTML shell. |
| `frontend/vercel.json` | Vercel static response headers. |
| `frontend/.env.example` | Safe frontend environment placeholder. |

## Backend Config

| Path | Purpose |
| --- | --- |
| `backend/requirements.txt` | Backend Python dependencies. |
| `backend/runtime.txt` | Python runtime declaration for deployment. |
| `backend/start.sh` | Shell startup wrapper for Uvicorn. |
| `backend/.env.example` | Safe backend environment placeholders. |
| `backend/app/config.py` | Runtime settings source and defaults. |

## PowerShell Scripts

| Path | Purpose |
| --- | --- |
| `scripts/setup-local.ps1` | Creates env files, ensures backend venv/dependencies, installs frontend dependencies. |
| `scripts/start-dev.ps1` | Starts backend and frontend together in one terminal. |
| `scripts/start-backend.ps1` | Starts only the backend dev server. |
| `scripts/start-frontend.ps1` | Starts only the frontend dev server. |
| `scripts/lib/local-dev.ps1` | Shared functions for repo discovery, dependency checks, env loading, local ports, and process management. |
| `scripts/lib/check_requirements.py` | Checks whether the venv satisfies `backend/requirements.txt`. |

## Frontend Package Scripts

| Script | Command | Purpose |
| --- | --- | --- |
| `dev` | `vite` | Start Vite dev server. |
| `build` | `vite build` | Build production frontend. |
| `lint` | `eslint .` | Run ESLint. |
| `test` | `vitest run` | Run frontend tests once. |
| `test:coverage` | `vitest run --coverage` | Run frontend tests once with coverage output. |
| `test:watch` | `vitest` | Run frontend tests in watch mode. |
| `typecheck` | `tsc --project jsconfig.json --noEmit` | Run JS typecheck using TypeScript. |
| `preview` | `vite preview` | Preview built frontend. |

## Backend Commands

No backend script runner is configured. Use module commands from `backend/`:

```powershell
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m pytest --cov=app --cov-report=term-missing --cov-report=xml
.\.venv\Scripts\python.exe -m ruff check app
.\.venv\Scripts\python.exe -c "from app.main import app; print(app.title)"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Deployment Config Files

Not present:

- `render.yaml`
- `Dockerfile`
- `docker-compose.yml`
- `Procfile`
