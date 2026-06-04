# Label Compliance Verifier

Phase 3 prototype for an AI-assisted alcohol label verification app.

This repository currently includes:

- FastAPI backend with `GET /health` and a deterministic `POST /verify` endpoint.
- React + Vite frontend with backend health check, single-file upload, expected fields form, and field-level result cards.

Batch processing and full documentation are intentionally deferred to later phases.

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
Frontend -> FastAPI /verify -> file validation -> image preprocessing -> OpenAI extraction -> deterministic verification -> structured response
```

The current Phase 3 flow extracts visible label text and fields when `OPENAI_API_KEY` is configured, then deterministic backend code compares extracted values with expected application data.

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

- Phase 4: batch upload UI and controlled backend batch processing.
- Phase 5-6: hardening, full docs, sample data, deployment readiness, and expanded tests.

Future OpenAI implementation should use the current OpenAI Python SDK syntax for Responses API image input and Structured Outputs. Prefer schema-enforced structured output over loose JSON parsing when practical. Verify the exact SDK syntax during implementation instead of relying on stale examples.

## Important Scope Notes

This Phase 3 prototype does not perform final legal compliance review. AI extracts visible label text, backend code verifies fields deterministically, and a human reviewer makes the final compliance judgment. Government warning bold text, font size, and placement checks remain out of scope.
