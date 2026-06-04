# Label Compliance Verifier

Phase 0-1 prototype for an AI-assisted alcohol label verification app.

This repository currently includes a working scaffold only:

- FastAPI backend with `GET /health` and a mock `POST /verify` endpoint.
- React + Vite frontend with backend health check, single-file upload, expected fields form, and mock result cards.

OpenAI extraction, real image preprocessing, deterministic verification, batch processing, upload limit enforcement, and full documentation are intentionally deferred to later phases.

## Repository Structure

```text
label-compliance-verifier/
|-- README.md
|-- frontend/
|-- backend/
|-- docs/
`-- sample-data/
```

## Current Data Flow

```text
Frontend -> FastAPI /health
Frontend -> FastAPI /verify -> mock verification service -> structured mock response
```

The current mock flow exists to prove the app shell, form handling, API client, and result display before adding AI extraction.

## Running The Backend

```bash
cd backend
python -m pip install -r requirements.txt
python -c "from app.main import app; print(app.title)"
uvicorn app.main:app --reload
```

Backend URL: `http://localhost:8000`

Health check:

```bash
curl http://localhost:8000/health
```

## Running The Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

The frontend reads the backend URL from `VITE_API_BASE_URL`. See `frontend/.env.example`.

## Checks

```bash
cd backend
python -m pytest
python -m ruff check app
```

```bash
cd frontend
npm run build
```

## Deferred Work

- Phase 2: backend file validation, image preprocessing, and OpenAI extraction.
- Phase 3: deterministic verification and text normalization.
- Phase 4: batch upload UI and controlled backend batch processing.
- Phase 5-6: hardening, full docs, sample data, deployment readiness, and expanded tests.

Future OpenAI implementation should use the current OpenAI Python SDK syntax for Responses API image input and Structured Outputs. Prefer schema-enforced structured output over loose JSON parsing when practical. Verify the exact SDK syntax during implementation instead of relying on stale examples.

## Important Scope Notes

This Phase 1 scaffold does not perform final legal compliance review and does not call OpenAI. It provides a mock field-by-field report so the product flow can be reviewed before AI extraction and deterministic verification are added.
