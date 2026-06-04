# Architecture

The app is a monorepo with a React/Vite frontend and FastAPI backend.

```text
User
-> React frontend
-> FastAPI routes
-> upload validation
-> image preprocessing
-> OpenAI extraction
-> deterministic verification
-> structured response
-> frontend results and CSV export
```

## Frontend

- `frontend/src/api/verificationApi.js` is the only endpoint-aware frontend module.
- Components render upload controls, expected fields, loading/error states, result summaries, batch tables, selected-label details, and extracted text.
- Reusable frontend logic stays in `frontend/src/utils`, including file validation, status styling, and CSV export.
- CSV export is client-side only and does not include raw extracted text.

## Backend

- Routes parse multipart inputs, build `ExpectedFields`, call service functions, and return structured responses.
- Services keep responsibilities separate: single-label orchestration, batch orchestration, OpenAI extraction, image preprocessing, timing, and deterministic verification.
- Utilities handle file validation, text normalization, response helpers, and safe logging.
- Uploaded images are processed in memory and are not permanently stored.

## Product Framing

AI extracts visible label text. Backend code verifies fields deterministically. A human agent makes the final compliance judgment.
