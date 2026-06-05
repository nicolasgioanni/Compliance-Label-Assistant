# Compliance Label Assistant

AI-assisted alcohol label verification for comparing label artwork against expected application data.

This prototype uses a hybrid AI + deterministic verification approach. A vision-capable model extracts visible text and likely label fields from uploaded alcohol label images. The backend then performs deterministic comparison between extracted values and expected application data. This keeps the AI portion focused on extraction while keeping verification decisions explainable and auditable.

The prototype does not perform final legal compliance review. It assists agents by flagging likely matches, mismatches, missing fields, and review-needed cases. Visual formatting checks such as bold text, exact font size, and label placement are out of scope and documented as limitations.

## Current Features

- Unified label queue for 1 to 5 uploaded JPG/PNG labels, with expected application fields stored per label.
- Per-label verification with AI extraction, deterministic comparison, extracted text, and timing metrics.
- Controlled batch concurrency with isolated per-file errors.
- Client-side CSV export for verified queue results, with unverified labels skipped.
- Backend-only OpenAI API key handling.
- In-memory upload validation, image resizing, and JPEG compression before extraction.

## Repository Structure

```text
label-compliance-verifier/
|-- README.md
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
-> frontend queue summary, selected-label details, extracted text, and CSV export
```

AI extracts visible label text. Backend code verifies fields. A human agent makes the final compliance judgment.

## Running Locally

Backend:

```powershell
cd backend
python -m pip install -r requirements.txt
$env:OPENAI_API_KEY="your-openai-key"
$env:ALLOWED_ORIGINS="http://localhost:5173"
python -c "from app.main import app; print(app.title)"
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```powershell
cd frontend
npm install
$env:VITE_API_BASE_URL="http://127.0.0.1:8000"
npm run dev
```

Open `http://localhost:5173`.

## Environment Variables

Backend variables are centralized in `backend/app/config.py` and documented in `backend/.env.example`:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_TIMEOUT_SECONDS`
- `MAX_FILE_SIZE_MB`
- `MAX_BATCH_SIZE`
- `BATCH_CONCURRENCY`
- `MAX_IMAGE_WIDTH`
- `ALLOWED_ORIGINS`

Frontend variables are documented in `frontend/.env.example`:

- `VITE_API_BASE_URL`

No OpenAI API key belongs in frontend code or frontend environment variables.

## API Endpoints

- `GET /health`
- `POST /verify`
- `POST /verify-batch`

See [docs/api-contract.md](docs/api-contract.md) for request and response details.

## CSV Export And Future Import

CSV export is implemented in the frontend for queue results. It exports `queue-verification-results.csv`, includes one row per verified label, skips unverified queue items, and does not include raw extracted text. The existing shared-field batch result CSV helper remains available for batch result data.

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
npm run build
```

## Limitations

- No final legal compliance decision.
- No COLA integration.
- No database, authentication, admin dashboard, payment, or account system.
- No persistent uploaded file storage.
- Government warning bold text, font size, and placement are not verified.
- The main frontend queue is limited to 5 labels and calls `/verify` once per queued label.
- The backend `/verify-batch` endpoint remains available for shared expected-field batch requests.
- External extraction depends on OpenAI API availability and correct backend configuration.
