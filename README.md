# Compliance Label Assistant

AI-assisted alcohol label verification for comparing label artwork against expected application data.

This prototype uses a hybrid AI + deterministic verification approach. A vision-capable model extracts visible text and likely label fields from uploaded alcohol label images. The backend then performs deterministic comparison between extracted values and expected application data. This keeps the AI portion focused on extraction while keeping verification decisions explainable and auditable.

The prototype does not perform final legal compliance review. It assists agents by flagging likely matches, mismatches, missing fields, and review-needed cases. Visual formatting checks such as bold text, exact font size, and label placement are out of scope and documented as limitations.

## Current Features

- Unified label queue for 1 to 10 uploaded JPG, PNG, WebP, or TIFF labels, with expected application fields stored per label.
- Per-label verification with AI extraction, deterministic comparison, extracted text, and timing metrics.
- Controlled batch concurrency with isolated per-file errors.
- Client-side CSV and Excel export for verified queue results.
- Backend-only OpenAI API key handling.
- In-memory upload validation, duplicate filename rejection, image resizing, and JPEG compression before extraction.

## Repository Structure

```text
label-compliance-verifier/
|-- README.md
|-- scripts/
|-- frontend/
|-- backend/
|-- docs/
`-- sample-data/
```

## Data Flow

```text
Frontend queue
-> FastAPI /verify once per queued label
-> backend upload validation
-> in-memory image preprocessing
-> one OpenAI extraction call per image
-> deterministic backend verification
-> structured response with statuses and timing
-> frontend queue summary, selected-label details, extracted text, and results export
```

AI extracts visible label text. Backend code verifies fields. A human agent makes the final compliance judgment.

## Running Locally

Recommended Windows one-terminal startup:

```powershell
.\scripts\start-dev.ps1
```

This creates or reuses `backend/.venv`, installs backend requirements only when the venv is missing, incomplete, or `requirements.txt` changed, installs frontend npm dependencies when `frontend/node_modules` is missing, loads `backend/.env` without printing secret values, and runs both servers in one terminal. Press `Ctrl+C` to stop both.

Before verifying labels, put your OpenAI key in `backend/.env`:

```powershell
notepad backend\.env
```

Set `OPENAI_API_KEY=your-openai-key`. Do not put OpenAI keys in frontend files.

Open `http://localhost:5173`. The backend runs at `http://127.0.0.1:8000`.

Useful script commands:

```powershell
.\scripts\setup-local.ps1       # install local backend/frontend dependencies
.\scripts\start-dev.ps1         # run backend and frontend together
.\scripts\start-backend.ps1     # run only FastAPI
.\scripts\start-frontend.ps1    # run only Vite
```

Optional ports:

```powershell
.\scripts\start-dev.ps1 -BackendPort 8010 -FrontendPort 5174
```

When custom ports are used, the scripts set the frontend API base URL and include the selected frontend origin in backend CORS settings for that process.

From a nested repo folder, use the repo root path:

```powershell
& "$((git rev-parse --show-toplevel).Trim())\scripts\start-dev.ps1"
```

A bare script path like `.\scripts\start-dev.ps1` only works from the repository root because PowerShell resolves `.\` relative to the current directory unless `scripts` is added to your `PATH`.

Manual two-terminal startup still works. Use one terminal for the backend:

```powershell
cd backend
python -m pip install -r requirements.txt
$env:OPENAI_API_KEY="your-openai-key"
$env:ALLOWED_ORIGINS="http://localhost:5173"
python -c "from app.main import app; print(app.title)"
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Use another terminal for the frontend:

```powershell
cd frontend
npm install
$env:VITE_API_BASE_URL="http://127.0.0.1:8000"
npm run dev -- --host localhost --port 5173
```

See [docs/local-development.md](docs/local-development.md) for first-run steps, script parameters, and troubleshooting.

## Environment Variables

Backend variables are centralized in `backend/app/config.py` and documented in `backend/.env.example`:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_TIMEOUT_SECONDS`
- `OPENAI_IMAGE_DETAIL`
- `OPENAI_MAX_RETRIES`
- `OPENAI_EXTRACTION_CONCURRENCY`
- `MAX_FILE_SIZE_MB`
- `MAX_IMAGE_PIXELS`
- `MAX_BATCH_SIZE`
- `BATCH_CONCURRENCY`
- `MAX_IMAGE_WIDTH`
- `JPEG_QUALITY`
- `ALLOWED_ORIGINS`

Frontend variables are documented in `frontend/.env.example`:

- `VITE_API_BASE_URL`

No OpenAI API key belongs in frontend code or frontend environment variables.

The default verification path reuses backend OpenAI clients, sends smaller compressed label images, uses low image
detail for speed and cost control, asks the model only for fields needed by deterministic comparison, and disables
hidden retries. If small warning text is missed, test `OPENAI_IMAGE_DETAIL=auto` or `high` against representative
labels and compare latency.

## API Endpoints

- `GET /health`
- `POST /verify`
- `POST /verify-batch`

See [docs/api-contract.md](docs/api-contract.md) for request and response details.

## Verification Behavior

- Brand names pass when the only differences are capitalization, repeated whitespace, or clearly harmless punctuation.
- Class/type values pass when they match after case and whitespace normalization, including line breaks.
- Alcohol content passes when the parsed ABV and proof values are numerically consistent, regardless of `Alc./Vol.` formatting or casing.
- Net contents pass when the quantity matches after unit normalization, including `mL`, `ml`, `ML`, and `milliliters`.
- Government warning heading is case-sensitive: `GOVERNMENT WARNING` must be uppercase, while `Government Warning`, `government warning`, and other casing variants fail.
- Government warning statement text is compared against the backend regulatory wording; punctuation or body-text uncertainty is marked for review instead of passing automatically.

## Results Export And Future Import

CSV and Excel export are implemented in the frontend for queue results. Exports use timestamped names like `label-compliance-verification-results_YYYY-MM-DD_HH-mm-ss.csv` or `label-compliance-verification-results_YYYY-MM-DD_HH-mm-ss.xlsx`, include one row per verified label, skip unverified queue items, and do not include raw extracted text. The `overall_status` export column reflects the backend verification result shown in the UI.

CSV import is a future scalability improvement. For larger submission batches, reviewers could upload a spreadsheet mapping filenames to expected application data so queued labels can be matched by filename and prefilled before verification.

## Deployment

Vercel frontend:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://your-render-api.onrender.com`

Render backend:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment variables: use the backend variables listed above.

## Checks

Backend:

```powershell
cd backend
python -m pytest
python -m ruff check app
python -c "from app.main import app; print(app.title)"
```

Frontend:

```powershell
cd frontend
npm run lint
npm run typecheck
npm test
npm run build
```

## Limitations

- No final legal compliance decision.
- No COLA integration.
- No database, authentication, admin dashboard, payment, or account system.
- No persistent uploaded file storage.
- PDF and HEIC/HEIF uploads are not supported in the MVP; they require additional decoding or rasterization dependencies.
- Government warning bold type, font size/font, and label placement are not verified.
- The main frontend queue is limited to 10 labels and calls `/verify` once per queued label.
- The backend `/verify-batch` endpoint remains available for shared expected-field batch requests.
- External extraction depends on OpenAI API availability and correct backend configuration.

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE).
