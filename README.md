# Compliance Label Assistant

Compliance Label Assistant is an AI-powered alcohol label verification prototype. It helps compare uploaded label artwork against expected application fields and is designed as a standalone proof of concept, not a direct COLA integration.

## Deployed Application

- Frontend URL: TBD before submission
- Backend API URL: TBD before submission

Update these values before final submission. Do not include private dashboard links or secrets.

## Key Features

- Upload JPG, PNG, WebP, or TIFF alcohol label images.
- Queue up to 10 label images in the frontend.
- Enter expected values for brand name, class/type, alcohol content, net contents, and government warning.
- Extract visible label fields through the backend OpenAI vision-model integration.
- Compare extracted fields with expected fields using deterministic backend verification rules.
- Display field-level pass, normalized match, fail, missing, needs-review, and error results.
- Verify one selected label or run the frontend queue workflow over ready labels.
- Export current verification results to CSV or XLSX.
- Validate file type, file size, image dimensions, and backend availability.
- Run the frontend and backend locally with repository PowerShell scripts or manual commands.

## Stakeholder Problem Addressed

Compliance reviewers manually compare label artwork to application data. This prototype targets routine matching work where a simple, fast UI can help reviewers identify likely matches, mismatches, and items that need manual review. Batch-oriented workflows matter because reviewers may need to process many labels, and slow tools are less likely to be adopted.

## Technical Approach

The React/Vite frontend handles image selection, queue state, expected field entry, API calls, result display, and exports. The FastAPI backend validates uploads, preprocesses images in memory, extracts label fields with an OpenAI vision model, and applies deterministic verification rules for selected fields. Extraction and verification are separate so provider output stays isolated from the comparison rules.

More detail is available in [docs/architecture/data-flow.md](docs/architecture/data-flow.md) and [docs/take-home/project-brief.md](docs/take-home/project-brief.md).

## Tools and Technologies

- Frontend: React 18, Vite 6, JavaScript, CSS, Vitest, Testing Library, ESLint.
- Backend: Python 3.11, FastAPI, Uvicorn, Pydantic, pytest, Ruff.
- Provider integration: OpenAI Python SDK.
- Image processing: Pillow.
- Export support: `write-excel-file` for XLSX and browser-generated CSV.
- Intended deployment: Vercel frontend and Render Starter backend.

## Assumptions

- The prototype is standalone and does not integrate with COLA.
- Uploaded test images should not contain sensitive real applicant data.
- Human review remains final, especially for ambiguous, low-quality, or unusual labels.
- The system verifies selected fields only; it does not validate every possible TTB requirement.
- Uploaded files are processed temporarily and are not persisted by the application code.
- Provider latency and deployment tier can affect verification speed.

## Trade-Offs and Limitations

- The prototype is not production compliance hardened.
- It does not include authentication, audit logging, a database, or persistent file storage.
- OpenAI extraction may be imperfect on glare, blur, poor lighting, tiny text, or unusual layouts.
- Government warning verification checks extracted text, not label typography, placement, or visual formatting.
- The UI verifies queued labels by calling the single-label endpoint for each ready item; the backend also exposes a shared expected-field `/verify-batch` endpoint that the current UI does not call.
- Performance depends on provider response time, image size, preprocessing settings, and deployment tier.

## Local Setup and Run Instructions

Prerequisites:

- Git
- Node.js compatible with the frontend Vite toolchain
- Python 3.11
- PowerShell on Windows for the repository helper scripts

```powershell
git clone <repository-url>
cd label-compliance-verifier
.\scripts\setup-local.ps1
```

Set the backend provider key in `backend\.env`:

```powershell
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

Manual frontend startup:

```powershell
cd frontend
npm install
$env:VITE_API_BASE_URL="http://127.0.0.1:8000"
npm run dev -- --host localhost --port 5173
```

Manual backend startup:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
$env:OPENAI_API_KEY="<OPENAI_API_KEY>"
$env:ALLOWED_ORIGINS="http://localhost:5173"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Basic smoke test:

1. Open `http://localhost:5173`.
2. Confirm the backend status indicator is online.
3. Upload a supported label image smaller than 5 MB.
4. Enter expected field values.
5. Run verification and review the field-level results.
6. Try an unsupported file type or oversized file and confirm a user-facing validation error.
7. Export verified results to CSV or XLSX.

Synthetic labels and expected manual inputs are available in [sample-data/README.md](sample-data/README.md).

For the longer setup guide, see [docs/take-home/setup-and-run.md](docs/take-home/setup-and-run.md).

## Environment Variables

Frontend:

- `VITE_API_BASE_URL`: backend API base URL used by the browser app.

Backend:

- `OPENAI_API_KEY`: required backend-only provider key.
- `ALLOWED_ORIGINS`: comma-separated frontend origins allowed by CORS.

Additional backend tuning variables are documented in [docs/backend/environment-variables.md](docs/backend/environment-variables.md) and [docs/deployment/environment-variables.md](docs/deployment/environment-variables.md). Use placeholders only and never commit real `.env` values.

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

## Documentation Map

- [Documentation index](docs/README.md)
- [Take-home project brief](docs/take-home/project-brief.md)
- [Take-home setup and run guide](docs/take-home/setup-and-run.md)
- [Take-home requirements mapping](docs/take-home/requirements-mapping.md)
- [Take-home deployment links](docs/take-home/deployment-links.md)
- [API documentation](docs/api/overview.md)
- [Frontend documentation](docs/frontend/overview.md)
- [Backend documentation](docs/backend/overview.md)
- [Deployment documentation](docs/deployment/overview.md)

## Repository Structure

```text
backend/      FastAPI app, schemas, routes, services, provider integration, tests
frontend/     React/Vite app, components, hooks, utilities, tests
docs/         Take-home, architecture, frontend, backend, API, deployment, and reference docs
scripts/      Local setup and development PowerShell scripts
sample-data/  Synthetic label fixtures, manual test data, and backend fixture-test data
```

## Submission Notes

- Source code is in this repository.
- Deployed application URLs should be added before final submission.
- Deep implementation documentation lives in [docs/](docs/README.md).

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE).
