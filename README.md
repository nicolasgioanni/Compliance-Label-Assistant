# Compliance Label Assistant

AI-assisted alcohol label verification for comparing label artwork against expected application data.

This prototype uses a hybrid AI + deterministic verification approach. A vision-capable model extracts visible text and likely label fields from uploaded alcohol label images. The backend then performs deterministic comparison between extracted values and expected application data. This keeps the AI portion focused on extraction while keeping verification decisions explainable and auditable.

The prototype does not perform final legal compliance review. It assists agents by flagging likely matches, mismatches, missing fields, and review-needed cases. Visual formatting checks such as bold text, exact font size, and label placement are out of scope and documented as limitations.

## Current Features

- Single-label verification with image upload, expected application fields, AI extraction, deterministic comparison, extracted text, and timing metrics.
- Limited batch verification for 2 to 10 uploaded JPG/PNG labels using shared expected application data.
- Controlled batch concurrency with isolated per-file errors.
- Client-side CSV export for batch results.
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
Frontend
-> FastAPI /verify or /verify-batch
-> backend upload validation
-> in-memory image preprocessing
-> one OpenAI extraction call per image
-> deterministic backend verification
-> structured response with statuses and timing
-> frontend cards, table, extracted text, and CSV export
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
- Batch mode uses one shared expected application dataset for all uploaded labels.
- External extraction depends on OpenAI API availability and correct backend configuration.
