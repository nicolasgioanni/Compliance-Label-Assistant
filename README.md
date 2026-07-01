# Compliance Label Assistant

Compliance Label Assistant is a standalone alcohol label verification prototype. It compares uploaded label artwork with expected application fields, shows field-level evidence, and helps reviewers identify labels that look correct, mismatched, missing, or in need of manual review.

This is an independent proof of concept. It is not a COLA integration, not an official TTB, Treasury, or government system, and not a final legal compliance review tool. Human review remains final.

## Live Demo And Source

| Resource | Link |
| --- | --- |
| Landing page | https://compliance-label-assistant.vercel.app |
| Verification tool | https://compliance-label-assistant.vercel.app/app |
| About page | https://compliance-label-assistant.vercel.app/about |
| Privacy Policy | https://compliance-label-assistant.vercel.app/privacy |
| Terms of Use | https://compliance-label-assistant.vercel.app/terms |
| Backend API | https://compliance-label-assistant.onrender.com |
| Source repository | https://github.com/nicolasgioanni/Compliance-Label-Assistant |
| Reviewer guide | [REVIEWER_GUIDE.md](REVIEWER_GUIDE.md) |
| Take-home deployment links | [docs/take-home/deployment-links.md](docs/take-home/deployment-links.md) |

The deployed frontend does not require a test account. Private dashboard links, credentials, tokens, provider keys, and real environment values remain outside repository documentation.

## What The App Does

- Accepts JPG/JPEG, PNG, WebP, and TIFF/TIF label images.
- Lets a reviewer queue up to 10 label images in the browser.
- Lets a reviewer enter expected values for brand name, class or type, alcohol content, net contents, bottler/producer, and country of origin.
- Applies the standard government warning text automatically.
- Uses the backend OpenAI vision-model integration to extract visible label fields.
- Compares extracted fields against expected fields with deterministic backend rules.
- Shows field-level statuses, extracted values, reasons, confidence values, and timing details.
- Exports current non-stale verification results to CSV or XLSX.
- Displays user-facing errors for upload validation, service connectivity, provider configuration, rate limiting, and verification failures.
- Provides prototype transparency pages for privacy, terms, AI use, and human-review boundaries.

The current frontend calls `GET /health`, `POST /warmup`, and `POST /verify`. The backend also exposes `POST /verify-batch` for a shared expected-field batch request, but the current frontend does not call that endpoint.

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

## Architecture At A Glance

- Frontend: React 18 and Vite in `frontend/`.
- Backend: FastAPI and Python 3.11 in `backend/`.
- API client: `frontend/src/api/verificationApi.js`.
- Backend entrypoint: `backend/app/main.py`.
- Backend configuration: `backend/app/config.py`.
- OpenAI provider boundary: `backend/app/providers/openai/`.
- Upload validation and preprocessing: `backend/app/image_processing/`.
- Deterministic verification rules: `backend/app/verification/`.
- Deployment target: Vercel frontend and Render backend.
- CI: split GitHub Actions workflows for backend, frontend, and repository hygiene.

I designed the backend so extraction and verification are separate. The model extracts visible fields from the label image, and deterministic Python logic compares those extracted values against expected application data. This keeps the AI portion focused on OCR-like extraction and keeps verification results explainable.

Deep technical documentation lives in [docs/](docs/README.md).

## Implementation Approach

The implementation is a standalone proof of concept rather than a COLA integration. Reviewers provide expected application values, upload label artwork, and review field-level comparison evidence.

The React/Vite frontend owns the reviewer workflow: upload, queue state, expected-field entry, result review, filtering, route navigation, legal/transparency pages, and export. API calls are centralized in `frontend/src/api/verificationApi.js`.

The FastAPI backend validates and preprocesses uploads before extraction. OpenAI provider code is isolated under `backend/app/providers/openai/`, while deterministic comparison rules live under `backend/app/verification/`. Route handlers remain thin and delegate workflow orchestration to service modules.

## Tools Used

- React 18, Vite 6, JavaScript, CSS, Vitest, Testing Library, and ESLint for the frontend.
- Python 3.11, FastAPI, Uvicorn, Pydantic, pytest, pytest-cov, and Ruff for the backend.
- OpenAI Python SDK for backend-only vision-model extraction.
- Pillow for image validation and preprocessing.
- `write-excel-file` and browser-generated CSV for exports.
- Vercel for the static frontend and Render Starter for the backend API.

## Assumptions

- The prototype is standalone and does not integrate with COLA.
- Reviewers provide expected application field values before verification.
- Uploaded test images are non-sensitive and suitable for prototype evaluation.
- Human review remains final for ambiguous, low-confidence, or unusual labels.
- The selected fields are enough to demonstrate the workflow; the app does not evaluate every federal alcohol labeling requirement.
- Uploaded images are processed temporarily by application code and are not persistently stored.
- The OpenAI extraction boundary can later be replaced by an approved OCR or AI provider.

## Trade-Offs And Limitations

- OpenAI vision extraction makes the prototype useful on varied label images, but it creates an external provider dependency, cost, and outbound network requirement.
- Extraction and verification are separated so model output does not directly decide pass or fail.
- The implementation intentionally omits persistent upload storage, authentication, a database, audit logging, and official review history because those controls require product, retention, and deployment decisions outside the prototype scope.
- The frontend queue calls `POST /verify` for each ready label so each queued label can keep its own expected field values. The backend `/verify-batch` endpoint remains available for shared expected-field batch requests.
- Image resizing and compression reduce payload size and latency, but tiny text, glare, blur, poor lighting, and unusual layouts can still affect extraction quality.
- Government warning checks are not replacements for human review of typography, placement, font size, boldness, or full label-layout requirements.

## Quick Start

Prerequisites:

- Git
- Node.js compatible with the Vite frontend toolchain
- Python 3.11
- PowerShell on Windows for repository helper scripts
- A backend OpenAI API key for local extraction-backed verification

```powershell
git clone https://github.com/nicolasgioanni/Compliance-Label-Assistant.git
cd Compliance-Label-Assistant
.\scripts\setup-local.ps1
```

Add a backend provider key to ignored `backend/.env`:

```text
OPENAI_API_KEY=<OPENAI_API_KEY>
```

Start both services:

```powershell
.\scripts\start-dev.ps1
```

Local URLs:

- Frontend landing page: `http://localhost:5173`
- Frontend verification tool: `http://localhost:5173/app`
- Backend API: `http://127.0.0.1:8000`
- Health check: `http://127.0.0.1:8000/health`

The longer evaluator setup path is in [docs/take-home/setup-and-run.md](docs/take-home/setup-and-run.md).

## Common Commands

Frontend commands from `frontend/`:

```powershell
npm run lint
npm run typecheck
npm test
npm run test:coverage -- --run
npm run build
```

Backend commands from `backend/`:

```powershell
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m pytest --cov=app --cov-report=term-missing --cov-report=xml
.\.venv\Scripts\python.exe -m ruff check app
.\.venv\Scripts\python.exe -c "from app.main import app; print(app.title)"
```

Expected import-check output:

```text
Compliance Label Assistant API
```

## Testing Overview

The repository uses focused automated checks rather than live provider calls in CI. Backend tests cover API contracts, upload validation, image preprocessing, provider error mapping, deterministic verification rules, rate limiting, batch behavior, CORS, and warmup behavior. Frontend tests cover the app shell, route navigation, queue workflow, upload handling, expected-field utilities, result navigation, export behavior, browser support, and status resolution.

GitHub Actions runs separate backend, frontend, and repository hygiene workflows on pull requests and pushes to `main`. See [testing and validation](docs/development/testing-and-validation.md) for the full command matrix and manual smoke checklist.

## Environment Variables

Frontend:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend API base URL used by browser requests. Defaults to `http://localhost:8000` in frontend code. |

Backend:

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Backend-only provider key required for extraction-backed verification. |
| `ALLOWED_ORIGINS` | Comma-separated browser origins allowed by CORS. |
| `VERIFICATION_DAILY_UNIT_LIMIT` | Daily global verification unit cap; default is 50. |

Additional backend tuning variables are documented in [backend environment variables](docs/backend/environment-variables.md) and [deployment environment variables](docs/deployment/environment-variables.md). Real `.env` values remain excluded from source control and documentation.

## Deployment Overview

- The Vercel project uses `frontend/` as the project root, `npm run build` as the build command, and `dist` as the output directory.
- The deployed frontend uses `VITE_API_BASE_URL=<BACKEND_URL>` for browser requests.
- The Render service uses `backend/` as the service root, Python 3.11, installed dependencies from `backend/requirements.txt`, and the Uvicorn start command documented in deployment docs.
- Render provides `PORT`; `backend/start.sh` runs Uvicorn with `${PORT:-8000}`.
- Provider secrets belong only in the backend deployment environment.

See [deployment overview](docs/deployment/overview.md), [frontend on Vercel](docs/deployment/frontend-vercel.md), and [backend on Render](docs/deployment/backend-render.md).

## Performance Smoke Context

A small warm-backend smoke test was run against the deployed Render backend API on 2026-06-09 using synthetic fixtures from `sample-data/images`. Each fixture was verified three times after calling `/warmup`; all documented medians in that run were under five seconds.

| Case | Scenario | Documented status | Median backend processing time | Median API request time |
| --- | --- | --- | ---: | ---: |
| TC01 | Clean baseline label | `pass` | 2,556 ms | 2,633 ms |
| TC03 | Clean label with intentional ABV mismatch | `pass` | 2,966 ms | 3,080 ms |
| TC10 | Low-light label with multiple expected mismatches | `pass` | 2,645 ms | 2,761 ms |
| TC09 | Rotated/glare image-quality case | `fail` | 3,323 ms | 3,463 ms |

These measurements are smoke-test context, not an SLA. Provider latency, Render cold starts, image complexity, and network conditions can affect response time. TC09 demonstrates the documented limitation that extraction quality can vary on glare, rotation, low light, and other imperfect images.

## Documentation Map

- [Reviewer guide](REVIEWER_GUIDE.md)
- [Documentation index](docs/README.md)
- [Take-home project brief](docs/take-home/project-brief.md)
- [Take-home engineering decisions](docs/take-home/engineering-decisions.md)
- [Take-home setup and run guide](docs/take-home/setup-and-run.md)
- [Take-home requirements mapping](docs/take-home/requirements-mapping.md)
- [Take-home deployment links](docs/take-home/deployment-links.md)
- [Architecture overview](docs/architecture/system-overview.md)
- [Frontend overview](docs/frontend/overview.md)
- [Backend overview](docs/backend/overview.md)
- [API overview](docs/api/overview.md)
- [Local development](docs/development/local-development.md)
- [Testing and validation](docs/development/testing-and-validation.md)
- [Troubleshooting](docs/development/troubleshooting.md)
- [Security and privacy](docs/security.md)
- [Performance and cost](docs/architecture/performance-and-cost.md)
- [Repository map](docs/reference/repository-map.md)
- [Known gaps](docs/maintenance/known-gaps.md)
- [Sample label fixtures](sample-data/README.md)

## Security And Privacy

- `OPENAI_API_KEY` is backend-only.
- Provider keys remain out of frontend code and Vercel frontend variables.
- `backend/.env`, `frontend/.env`, real tokens, private dashboard URLs, uploaded payloads, and sensitive operational details remain excluded from committed files.
- Uploaded files are validated and processed temporarily by application code; they are not persistently stored by this prototype.
- CSV export neutralizes formula-like prefixes and does not export raw extracted text.

The prototype does not include authentication, authorization, a database, audit logging, malware scanning, persistent document retention, production monitoring, or long-running batch infrastructure. Production government deployment would require additional review for personally identifiable information, retention, audit logging, access control, network egress, approved AI/OCR infrastructure, monitoring, and rate limiting.

## Disclaimer

Compliance Label Assistant assists with selected field comparison for a prototype review workflow. It does not replace reviewer judgment, provide legal advice, make official compliance determinations, or represent an official government system.

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE).
