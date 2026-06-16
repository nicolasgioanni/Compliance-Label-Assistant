# Compliance Label Assistant

Compliance Label Assistant is a standalone alcohol label verification prototype. It compares uploaded label artwork with expected application fields, then shows field-level results that help a reviewer identify likely matches, mismatches, missing fields, and items that need manual review.

This is an independent proof of concept. It is not a COLA integration, not an official government system, and not a final legal compliance review tool. Human review remains final.

## Live Demo And Source

| Resource | Link |
| --- | --- |
| Deployed frontend | https://compliance-label-assistant.vercel.app |
| Backend API | https://compliance-label-assistant.onrender.com |
| Source repository | https://github.com/nicolasgioanni/label-compliance-verifier |
| Reviewer guide | [REVIEWER_GUIDE.md](REVIEWER_GUIDE.md) |
| Take-home deployment links | [docs/take-home/deployment-links.md](docs/take-home/deployment-links.md) |

The deployed frontend does not require a test account. No provider keys, dashboard URLs, tokens, or private deployment settings are included in this repository.

## What The App Does

- Accepts JPG/JPEG, PNG, WebP, and TIFF/TIF label images.
- Lets a reviewer queue up to 10 label images in the browser.
- Lets a reviewer enter expected values for brand name, class or type, alcohol content, net contents, bottler/producer, and country of origin.
- Applies the standard government warning text automatically.
- Uses the backend OpenAI vision-model integration to extract visible label fields.
- Compares extracted fields against expected fields with deterministic backend rules.
- Shows field-level statuses, extracted values, reasons, confidence values, and timing details.
- Exports current non-stale verification results to CSV or XLSX.
- Displays user-facing errors for upload validation, service connectivity, provider configuration, and verification failures.

The frontend calls `GET /health`, `POST /warmup`, and `POST /verify`. The backend also exposes `POST /verify-batch` for a shared expected-field batch request, but the current frontend does not call that endpoint.

## Fields Verified

The current prototype verifies:

- Brand name
- Class or type
- Alcohol content
- Net contents
- Bottler/producer
- Country of origin
- Government warning text

Government warning verification is strict for extracted text. The backend checks for the required uppercase `GOVERNMENT WARNING:` heading and the standard warning wording. The prototype does not make final typography, boldness, font-size, placement, or label-layout determinations.

## Architecture Summary

- Frontend: React 18 and Vite in `frontend/`.
- Backend: FastAPI and Python 3.11 in `backend/`.
- API client: `frontend/src/api/verificationApi.js`.
- Backend entrypoint: `backend/app/main.py`.
- Backend configuration: `backend/app/config.py`.
- OpenAI provider boundary: `backend/app/providers/openai/`.
- Upload validation and preprocessing: `backend/app/image_processing/`.
- Deterministic verification rules: `backend/app/verification/`.
- Deployment target: Vercel frontend and Render backend.

I designed the backend so extraction and verification are separate. The model extracts visible fields from the label image, and deterministic Python logic compares those extracted values against expected application data. This keeps the AI portion focused on OCR-like extraction and keeps verification results explainable.

## Quick Start

Prerequisites:

- Git
- Node.js compatible with the Vite frontend toolchain
- Python 3.11
- PowerShell on Windows for the repository helper scripts
- A backend OpenAI API key for local extraction-backed verification

```powershell
git clone https://github.com/nicolasgioanni/label-compliance-verifier.git
cd label-compliance-verifier
.\scripts\setup-local.ps1
```

Add a backend provider key to ignored `backend\.env`:

```text
OPENAI_API_KEY=<OPENAI_API_KEY>
```

Start both local services:

```powershell
.\scripts\start-dev.ps1
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://127.0.0.1:8000`
- Health check: `http://127.0.0.1:8000/health`

The longer evaluator setup path is in [docs/take-home/setup-and-run.md](docs/take-home/setup-and-run.md).

## Manual Startup

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
$env:OPENAI_API_KEY="<OPENAI_API_KEY>"
$env:ALLOWED_ORIGINS="http://localhost:5173"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend, in a separate terminal:

```powershell
cd frontend
npm install
$env:VITE_API_BASE_URL="http://127.0.0.1:8000"
npm run dev -- --host localhost --port 5173
```

## Environment Variables

Frontend:

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Required for deployed frontend, optional locally because a code default exists | Backend API base URL used by browser requests. |

Backend:

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | Required for verification requests | Backend-only provider key. |
| `ALLOWED_ORIGINS` | Required when the frontend origin differs from the default | Comma-separated CORS allowlist. |

Additional backend tuning variables are documented in [docs/backend/environment-variables.md](docs/backend/environment-variables.md) and [docs/deployment/environment-variables.md](docs/deployment/environment-variables.md). Use placeholders only and do not commit real `.env` values.

## Approach

I designed the prototype as a standalone proof of concept rather than a COLA integration. Reviewers enter expected application values, upload label artwork, and review the backend's field-level comparison results.

The backend validates and preprocesses uploads before extraction. OpenAI provider code is isolated behind `backend/app/providers/openai/`, while deterministic comparison rules live under `backend/app/verification/`. Route handlers stay thin and delegate workflow orchestration to service modules.

The frontend focuses on the reviewer workflow: upload, queue, expected data entry, selected-label verification, ready-label verification, result review, and export. It keeps API calls centralized in `frontend/src/api/verificationApi.js`.

## Tools Used

- React 18, Vite 6, JavaScript, CSS, Vitest, Testing Library, and ESLint for the frontend.
- Python 3.11, FastAPI, Uvicorn, Pydantic, pytest, and Ruff for the backend.
- OpenAI Python SDK for backend-only vision-model extraction.
- Pillow for image validation and preprocessing.
- `write-excel-file` and browser-generated CSV for exports.
- Vercel for the static frontend and Render Starter for the backend API.

## Assumptions

- The prototype is standalone and does not integrate with COLA.
- Reviewers provide expected application field values before verification.
- Uploaded test images should not contain sensitive real applicant data.
- Human review remains final, especially for ambiguous, low-quality, or unusual labels.
- The selected fields are enough to demonstrate the workflow; the app does not evaluate every federal alcohol labeling requirement.
- Uploaded images are processed temporarily by application code and are not persistently stored.
- The OpenAI extraction boundary could be replaced later by an approved OCR or AI provider.

## Tradeoffs

- I used OpenAI vision extraction to make the prototype useful on varied label images, but that creates an external provider dependency and outbound network requirement.
- I separated extraction from verification so model output does not directly decide pass or fail.
- I intentionally avoided persistent upload storage, authentication, a database, and audit logging because those controls require product, retention, and deployment decisions outside the prototype scope.
- The frontend queue calls `POST /verify` for each ready label so each queued label can keep its own expected field values. The backend `/verify-batch` endpoint remains available for shared expected-field batch requests.
- Image resizing and compression reduce payload size and latency, but tiny text, glare, blur, poor lighting, and unusual layouts can still affect extraction quality.

## Security And Privacy

- `OPENAI_API_KEY` is backend-only and must not be configured in frontend code or Vercel frontend variables.
- The frontend never calls OpenAI directly.
- `.env` files are ignored, and checked-in examples use placeholders or safe defaults.
- The backend validates extension, MIME type, decoded image format, file size, readability, and decoded pixel count before extraction.
- Uploaded images are processed in memory by application code and are not persistently stored to disk or a database.
- CORS is configured through `ALLOWED_ORIGINS`.
- User-entered and extracted text is rendered as text, not raw HTML.
- CSV export neutralizes formula-like prefixes and does not export raw extracted text.

The prototype does not include authentication, authorization, a database, audit logging, malware scanning, persistent document retention, production monitoring, or long-running batch infrastructure. Production government deployment would require additional review for personally identifiable information, retention, audit logging, access control, network egress, approved AI/OCR infrastructure, monitoring, and rate limiting.

## Limitations

- This is not a final legal compliance decision tool.
- The app does not integrate with COLA or ingest COLA PDFs.
- Extraction can be imperfect on glare, blur, poor lighting, curved labels, tiny text, or unusual layouts.
- Government warning checks do not replace human review of typography, placement, font size, boldness, or full label-layout requirements.
- The current implementation does not persist review history or final reviewer decisions.
- Performance depends on provider response time, image complexity, network conditions, and deployment tier.

## Testing

Frontend validation:

```powershell
cd frontend
npm run lint
npm run typecheck
npm test
npm run build
```

Backend validation:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m ruff check app
.\.venv\Scripts\python.exe -c "from app.main import app; print(app.title)"
```

Sample labels and manual test inputs are documented in [sample-data/README.md](sample-data/README.md).

## Deployment

- Frontend: Vercel static deployment from `frontend/`.
- Backend: Render web service from `backend/`.
- Vercel needs `VITE_API_BASE_URL` set to the public backend API base URL.
- Render needs `OPENAI_API_KEY` and `ALLOWED_ORIGINS` configured in backend environment settings.
- Deployment setup details are in [docs/deployment/overview.md](docs/deployment/overview.md), [docs/deployment/frontend-vercel.md](docs/deployment/frontend-vercel.md), and [docs/deployment/backend-render.md](docs/deployment/backend-render.md).

## Documentation Map

- [Reviewer guide](REVIEWER_GUIDE.md)
- [Documentation index](docs/README.md)
- [Take-home project brief](docs/take-home/project-brief.md)
- [Take-home engineering decisions](docs/take-home/engineering-decisions.md)
- [Take-home setup and run guide](docs/take-home/setup-and-run.md)
- [Take-home requirements mapping](docs/take-home/requirements-mapping.md)
- [Take-home deployment links](docs/take-home/deployment-links.md)
- [API documentation](docs/api/overview.md)
- [Frontend documentation](docs/frontend/overview.md)
- [Backend documentation](docs/backend/overview.md)
- [Security documentation](docs/security.md)

## Repository Structure

```text
backend/      FastAPI app, schemas, routes, services, provider integration, tests
frontend/     React and Vite app, components, hooks, utilities, tests
docs/         Take-home, architecture, frontend, backend, API, deployment, and reference docs
scripts/      Local setup and development PowerShell scripts
sample-data/  Synthetic label fixtures, manual test data, and backend fixture-test data
```

## Disclaimer

Compliance Label Assistant assists with selected field comparison for a prototype review workflow. It does not replace reviewer judgment, provide legal advice, make official compliance determinations, or represent an official government system.

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE).
