# Repository Map

## Top-Level Layout

```text
label-compliance-verifier/
|-- backend/
|-- docs/
|-- frontend/
|-- sample-data/
|-- scripts/
|-- .gitattributes
|-- .gitignore
|-- LICENSE
`-- README.md
```

## Top-Level Directories

| Path | Purpose |
| --- | --- |
| `backend/` | FastAPI backend, provider integration, image processing, verification rules, tests, runtime files. |
| `frontend/` | Vite React frontend, queue UI, API client, hooks, components, styles, frontend tests. |
| `docs/` | Documentation system and compatibility navigation pages. |
| `scripts/` | PowerShell local setup/start scripts and shared local-development helpers. |
| `sample-data/` | Placeholder README; no real sample label images are included. |

## Important Root Files

| Path | Purpose |
| --- | --- |
| `README.md` | Short project entrypoint and links to detailed docs. |
| `LICENSE` | Apache License 2.0. |
| `.gitignore` | Excludes env files, dependency folders, caches, build outputs, logs, and editor folders. |
| `.gitattributes` | Normalizes line endings and marks common binary files. |

## Frontend Start Points

- `frontend/src/main.jsx`
- `frontend/src/App.jsx`
- `frontend/src/components/verification/VerificationForm.jsx`
- `frontend/src/api/verificationApi.js`
- `frontend/src/hooks/useQueueItems.js`

## Backend Start Points

- `backend/app/main.py`
- `backend/app/routes/verification.py`
- `backend/app/services/single_verification_service.py`
- `backend/app/services/batch_service.py`
- `backend/app/providers/openai/extraction.py`
- `backend/app/verification/rules.py`

## Deployment Start Points

- Frontend Vercel settings are documented in `docs/deployment/frontend-vercel.md`.
- Backend Render settings are documented in `docs/deployment/backend-render.md`.
- `backend/runtime.txt` declares Python `3.11.9`.
- `backend/start.sh` starts Uvicorn using `$PORT`.

No checked-in deployment platform config files are present.

## Files And Folders Not Documented In Detail

- `frontend/node_modules/`
- `backend/.venv/`
- `frontend/dist/`
- `.pytest_cache/`
- `.ruff_cache/`
- `coverage/`
- `__pycache__/`
- `*.log`
- `.env` files with real local values
- lockfile internals
- binary asset internals such as `frontend/public/cla-logo.png`

## Change Starting Points

| Change area | Start here |
| --- | --- |
| Frontend API calls | `frontend/src/api/verificationApi.js` |
| Frontend queue behavior | `frontend/src/hooks/useQueueItems.js` and `frontend/src/utils/queueItemState.js` |
| Frontend upload validation | `frontend/src/utils/fileValidation.js` and `frontend/src/utils/queueFileValidation.js` |
| Frontend export | `frontend/src/utils/resultExport.js` |
| Backend route behavior | `backend/app/routes/verification.py` |
| Backend upload validation | `backend/app/image_processing/validation.py` |
| Backend preprocessing | `backend/app/image_processing/preprocessor.py` |
| Provider behavior | `backend/app/providers/openai/` |
| Verification rules | `backend/app/verification/rules.py` |
| Environment variables | `backend/app/config.py`, `frontend/src/api/verificationApi.js` |
| Local scripts | `scripts/lib/local-dev.ps1` |
