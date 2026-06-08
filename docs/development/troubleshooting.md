# Troubleshooting

## Frontend Fails To Start

Symptom: `npm run dev` fails.

Likely causes:

- `frontend/node_modules` missing.
- Node.js or npm missing.
- Port already in use.

Check:

- `frontend/package.json`
- `frontend/vite.config.js`
- `.\scripts\start-frontend.ps1`

Safe fix:

```powershell
.\scripts\setup-local.ps1
.\scripts\start-frontend.ps1 -FrontendPort 5174
```

Do not put provider keys in frontend env files.

## Backend Fails To Start

Symptom: Uvicorn exits or import check fails.

Likely causes:

- `backend/.venv` missing.
- Dependencies not installed.
- Wrong working directory.
- Port already in use.

Check:

- `backend/requirements.txt`
- `backend/app/main.py`
- `.\scripts\start-backend.ps1`

Safe fix:

```powershell
.\scripts\setup-local.ps1
.\scripts\start-backend.ps1 -BackendPort 8010
```

## Missing Environment Variables

Symptom: verification returns a setup/configuration error.

Likely cause:

- `OPENAI_API_KEY` is missing from backend environment.

Check:

- `backend/.env`
- Render environment settings
- `backend/app/config.py`

Safe fix:

```text
OPENAI_API_KEY=<OPENAI_API_KEY>
```

Do not commit real values.

## API Base URL Wrong

Symptom: frontend shows service unavailable or browser `Failed to fetch`.

Likely cause:

- `VITE_API_BASE_URL` points to the wrong backend URL.

Check:

- `frontend/.env`
- Vercel `VITE_API_BASE_URL`
- `frontend/src/api/verificationApi.js`

Safe fix:

```text
VITE_API_BASE_URL=<BACKEND_URL>
```

## CORS Errors

Symptom: browser console shows CORS failure.

Likely cause:

- Backend `ALLOWED_ORIGINS` does not include the frontend origin.

Check:

- `backend/app/main.py`
- `backend/app/config.py`
- `ALLOWED_ORIGINS`

Safe fix:

```text
ALLOWED_ORIGINS=<FRONTEND_URL>
```

Use a comma-separated list for multiple origins.

## Upload Fails

Symptom: upload or verification rejects a file.

Likely causes:

- Unsupported extension.
- Unsupported MIME type.
- Extension/content mismatch.
- File is empty.
- File exceeds `MAX_FILE_SIZE_MB`.
- Decoded image exceeds `MAX_IMAGE_PIXELS`.

Check:

- `frontend/src/utils/fileValidation.js`
- `backend/app/image_processing/validation.py`

Safe fix:

- Use JPG, PNG, WebP, or TIFF.
- Use a smaller readable image.
- Keep frontend and backend file limits aligned.

## Image Preprocessing Fails

Symptom: backend returns an image processing error.

Likely cause:

- Pillow cannot prepare the image after validation.

Check:

- `backend/app/image_processing/preprocessor.py`
- `MAX_IMAGE_WIDTH`
- `JPEG_QUALITY`

Safe fix:

- Try a readable JPG, PNG, WebP, or TIFF.
- Do not bypass backend validation.

## Provider Request Fails

Symptom: backend returns `502` provider unavailable or processing error.

Likely causes:

- Provider outage.
- Timeout.
- Rate limit.
- Invalid backend provider configuration.

Check:

- `OPENAI_API_KEY`
- `OPENAI_TIMEOUT_SECONDS`
- `OPENAI_MAX_RETRIES`
- `backend/app/providers/openai/extraction.py`

Safe fix:

- Confirm backend provider key is configured.
- Retry later for temporary provider failures.
- Adjust timeout or retry settings only after testing.

## Invalid Provider Response

Symptom: backend returns `502` invalid structured response.

Likely cause:

- Provider output could not be parsed into expected fields.

Check:

- `backend/app/providers/openai/extraction.py`
- `backend/app/tests/test_openai_extraction_service.py`

Safe fix:

- Retry the request.
- Add a focused provider parsing test before changing parser behavior.

## Verification Result Looks Wrong

Symptom: field status does not match reviewer expectation.

Likely causes:

- Extracted field differs from expected data.
- Optional expected field was blank and skipped.
- Government warning heading casing is not uppercase.
- Numeric ABV/proof or net-content parsing differs from input wording.

Check:

- `backend/app/verification/rules.py`
- `backend/app/utils/text_normalization.py`
- selected result field reasons in the UI

Safe fix:

- Verify expected field values.
- Add or update backend verification tests before changing rule behavior.

## Vercel Deployment Fails

Symptom: frontend build or deployment fails.

Likely causes:

- Wrong root directory.
- Wrong build command.
- Missing dependency install.
- Build fails locally.

Check:

- Vercel root: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- `frontend/package.json`

Safe fix:

```powershell
cd frontend
npm run build
```

## Render Deployment Fails

Symptom: backend build or start fails.

Likely causes:

- Wrong root directory.
- Dependencies not installed.
- Wrong start command.
- Missing environment variables.

Check:

- Render root: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- `backend/runtime.txt`

Safe fix:

- Match the documented Render settings.
- Configure backend environment variables in Render.

## Tests Fail

Symptom: pytest or Vitest fails.

Check:

- Failure file and assertion.
- Recent API contract or queue state changes.
- Mocked provider behavior in backend tests.

Safe fix:

- Fix the behavior or update tests only when behavior intentionally changed.

## Build Fails

Symptom: `npm run build` fails.

Check:

- `frontend/vite.config.js`
- `frontend/jsconfig.json`
- import paths
- lint/typecheck output

Safe fix:

```powershell
cd frontend
npm run lint
npm run typecheck
npm run build
```
