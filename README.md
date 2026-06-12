# Compliance Label Assistant

Compliance Label Assistant is an AI-powered alcohol label verification prototype. It helps compare uploaded label artwork against expected application fields and is designed as a standalone proof of concept, not a direct COLA integration.

## Deployed Application

- Landing page: https://compliance-label-assistant.vercel.app
- About page: https://compliance-label-assistant.vercel.app/about
- Direct verification tool: https://compliance-label-assistant.vercel.app/app
- Backend API: https://compliance-label-assistant.onrender.com
- Source code: https://github.com/nicolasgioanni/label-compliance-verifier

These are public application URLs. Do not include private dashboard links or secrets.

For take-home review, use the direct verification tool URL:
https://compliance-label-assistant.vercel.app/app

The landing page content is static; the shared header performs a lightweight backend health check. The verification tool calls the Render backend for verification, and the frontend does not expose the OpenAI API key. Human review remains final. This is an independent prototype, not an official TTB system. The shared footer displays a persistent disclaimer that the app is an independent prototype and not an official TTB, Treasury, or government system.

## Evaluator Quick Facts

- No test account is required for the deployed frontend.
- Local verification requires a backend `OPENAI_API_KEY`; no provider key is included in this repository.
- The current prototype verifies brand name, class or type, alcohol content, net contents, bottler/producer, country of origin, and government warning text.
- Sample labels and manual test inputs are documented in [sample-data/README.md](sample-data/README.md).
- Current known gaps: no direct COLA integration, no COLA PDF ingestion, no authentication, no database, no audit trail, no persistent uploaded-file storage, no final legal compliance decision, and no full government-warning typography or placement verification.
- The fastest evaluator path is [REVIEWER_GUIDE.md](REVIEWER_GUIDE.md).

## Key Features

- Upload JPG, PNG, WebP, or TIFF alcohol label images.
- Queue up to 10 label images in the frontend.
- Enter expected values for brand name, class or type, alcohol content, net contents, bottler/producer, and country of origin; the standard government warning is applied automatically.
- Extract visible label fields through the backend OpenAI vision-model integration.
- Compare extracted fields with expected fields using deterministic backend verification rules.
- Display field-level pass, normalized match, fail, missing, needs-review, and error details; top-level label results are pass, fail, or error.
- Verify one selected label or run the frontend queue workflow over ready labels.
- Export current verification results to CSV or XLSX.
- Validate file type, file size, image dimensions, and backend availability.
- Run the frontend and backend locally with repository PowerShell scripts or manual commands.

## Stakeholder Problem Addressed

Compliance reviewers manually compare label artwork to application data. This prototype targets routine matching work where a simple, fast user interface can help reviewers identify likely matches, mismatches, and items that need manual review. Batch-oriented workflows matter because reviewers may need to process many labels, and slow tools are less likely to be adopted.

## Technical Approach

The React and Vite frontend handles image selection, queue state, expected field entry, API calls, result display, and exports. The FastAPI backend validates uploads, preprocesses images in memory, extracts label fields with an OpenAI vision model, and applies deterministic verification rules for selected fields. Extraction and verification are separate so provider output stays isolated from the comparison rules.

More detail is available in [docs/architecture/data-flow.md](docs/architecture/data-flow.md), [docs/take-home/project-brief.md](docs/take-home/project-brief.md), and [docs/take-home/engineering-decisions.md](docs/take-home/engineering-decisions.md).

## Security Posture

- `OPENAI_API_KEY` is backend-only; the frontend never calls OpenAI directly.
- Uploaded images are validated and processed in memory by the backend and are not persistently stored by application code.
- Backend validation checks supported type, size, decoded readability, and decoded pixel count before extraction.
- Queue, batch, upload-size, pixel-count, timeout, and concurrency limits help control cost and basic abuse.
- Deployed Render CORS must set `ALLOWED_ORIGINS` to the deployed Vercel origin.
- CSV export neutralizes spreadsheet formula prefixes and excludes raw extracted text.

The prototype is not production-ready for government use. Production deployment would need authentication, access control, audit logging, PII handling, retention policy, network egress review, production monitoring, stronger rate limiting, larger batch-job processing, and an agency-approved OCR or vision provider. Cloud AI providers may not be allowed in restricted government networks.

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
- The OpenAI extraction boundary can be replaced later by an approved OCR or AI provider.
- Provider latency and deployment tier can affect verification speed.

## Trade-Offs and Limitations

- The prototype is not production compliance or security hardened.
- It does not include authentication, audit logging, a database, or persistent file storage.
- OpenAI extraction may be imperfect on glare, blur, poor lighting, tiny text, or unusual layouts.
- Government warning verification is strict for extracted text: the backend checks presence, uppercase `GOVERNMENT WARNING:` heading, and exact standard wording. The prototype does not make final typography, boldness, font-size, placement, or label-layout determinations; those remain human-review items.
- The user interface verifies queued labels by calling the single-label endpoint for each ready item; the backend also exposes a shared expected-field `/verify-batch` endpoint that the current user interface does not call.
- Performance depends on provider response time, image size, preprocessing settings, and deployment tier.

## Performance Smoke Test

On 2026-06-09, I ran a small warm-backend smoke test against the deployed Render backend API using synthetic fixtures from `sample-data/images`. Each fixture was verified three times after calling `/warmup`; the table reports median timings. All documented medians in this run were under five seconds.

| Case | Scenario | Observed status | Median backend processing time | Median API request time |
| --- | --- | --- | ---: | ---: |
| TC01 | Clean baseline label | `pass` | 2,556 ms | 2,633 ms |
| TC03 | Clean label with intentional ABV mismatch | `pass` | 2,966 ms | 3,080 ms |
| TC10 | Low-light label with multiple expected mismatches | `pass` | 2,645 ms | 2,761 ms |

These are smoke-test timings, not an SLA. Provider latency, Render cold starts, image complexity, and network conditions can affect response time. The backend also returns `processing_time_ms`, `validation_time_ms`, `preprocessing_time_ms`, `extraction_time_ms`, and `verification_time_ms` for more detailed inspection.

I also tested `TC09` as a rotated/glare image-quality case. It completed quickly, with a 3,323 ms median backend processing time and 3,463 ms median API request time, but returned `fail` in the live provider-backed runs. That result is consistent with the documented limitation that extraction quality can vary on glare, rotation, low light, and other imperfect images.

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

- Frontend landing page: `http://localhost:5173`
- Frontend about page: `http://localhost:5173/about`
- Frontend verification tool: `http://localhost:5173/app`
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

1. Open `http://localhost:5173/app`.
2. Confirm the backend status indicator is online.
3. Upload a supported label image smaller than 5 MB.
4. Enter expected values for brand name, class or type, alcohol content, net contents, bottler/producer, and country of origin; the standard government warning is applied automatically.
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
- [Deployment documentation](docs/deployment/overview.md)

## Repository Structure

```text
backend/      FastAPI app, schemas, routes, services, provider integration, tests
frontend/     React and Vite app, components, hooks, utilities, tests
docs/         Take-home, architecture, frontend, backend, API, deployment, and reference docs
scripts/      Local setup and development PowerShell scripts
sample-data/  Synthetic label fixtures, manual test data, and backend fixture-test data
```

## Submission Notes

- Source code is in this repository.
- Deployed application URLs are listed above and in [docs/take-home/deployment-links.md](docs/take-home/deployment-links.md).
- Deep implementation documentation lives in [docs/](docs/README.md).

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE).
