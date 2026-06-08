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
-> frontend results and results export
```

## Frontend

- `frontend/src/api/verificationApi.js` is the only endpoint-aware frontend module.
- Components render the label queue, upload controls, per-label expected fields, loading/error states, queue summaries, selected-label details, and extracted text.
- Hooks coordinate queue orchestration, verification locking, remove animations, and shared dialog dismissal behavior.
- Reusable frontend logic stays in `frontend/src/utils`, including file validation, queue-item transitions, status selectors, status styling, and results export.
- Component styles are split into ordered partials under `frontend/src/styles/components` and bundled through `frontend/src/styles/components.css`.
- Backend verification responses are stored as automated evidence on queue items. Frontend manual decisions are stored separately in browser memory, and final/effective status is derived from those two sources.
- CSV and Excel export are client-side only, skip unverified queue items, and do not include raw extracted text. Export rows are derived at download time from the current queue state.
- Future CSV import can populate each queue item's expected fields by matching spreadsheet rows to queued files by filename.

## Backend

- Routes parse multipart inputs, build `ExpectedFields`, call service functions, and return structured responses.
- Services keep responsibilities separate: single-label orchestration, batch orchestration, OpenAI extraction, image preprocessing, timing, and deterministic verification.
- Utilities handle file validation, text normalization, response helpers, and safe logging.
- Uploaded images are processed in memory and are not permanently stored.

## Product Framing

AI extracts visible label text. Backend code verifies fields deterministically. A human agent makes the final compliance judgment.

The frontend can record a per-label human final decision in React memory for the current page session. This decision changes queue badges, summary counts, selected-label final status, and exports, but it does not change backend verification evidence or create persistent review history.
