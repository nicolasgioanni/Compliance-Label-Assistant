# Frontend Setup

## Location

`frontend/`

## Install

From the repository root, the recommended setup command is:

```powershell
.\scripts\setup-local.ps1
```

Frontend-only install:

```powershell
cd frontend
npm install
```

The repository includes `frontend/package-lock.json`; use `npm install` locally because that is what the project scripts run.

## Run

Recommended full-stack startup:

```powershell
.\scripts\start-dev.ps1
```

Frontend-only startup:

```powershell
.\scripts\start-frontend.ps1
```

Manual frontend startup:

```powershell
cd frontend
$env:VITE_API_BASE_URL="<BACKEND_URL>"
npm run dev -- --host localhost --port 5173
```

## Build

```powershell
cd frontend
npm run build
```

Build output is `frontend/dist/`, which is ignored by Git.

## Preview Build

```powershell
cd frontend
npm run preview
```

## Browser Targets

`frontend/vite.config.js` builds for:

- Chrome 109+
- Edge 109+
- Firefox 102+
- Safari 15+

The same browser target set appears in `frontend/package.json` under `browserslist`.

## Environment

The frontend reads only:

- `VITE_API_BASE_URL`

See [frontend environment variables](environment-variables.md).
