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
- Queue components render the label list, filters, actions, and summary; verification components render the selected-label workspace, expected fields, selected result details, field cards, and extracted text.
- Hooks coordinate queue orchestration, verification locking, remove animations, and shared dialog dismissal behavior.
- Reusable frontend logic stays in `frontend/src/utils`, including file validation, queue-item transitions, status selectors, status styling, and results export.
- Component styles are split into ordered partials under `frontend/src/styles/components` and bundled through `frontend/src/styles/components.css`.
- Label preview is client-side only. It renders the existing in-memory `File` through a temporary browser object URL and revokes that URL when the preview closes or changes.
- Backend verification responses are stored as evidence on queue items. Queue badges, summary counts, selected-label status, and exports use the backend `overall_status`.
- The frontend queue calls `/verify` once per ready queued item; `/verify-batch` remains a backend endpoint for shared expected-field batch requests and is not used by the current queue UI.
- CSV and Excel export are client-side only, skip unverified queue items, and do not include raw extracted text. Export rows are derived at download time from the current queue state.
- Future CSV import can populate each queue item's expected fields by matching spreadsheet rows to queued files by filename.

## Backend

- Routes parse multipart inputs, build `ExpectedFields`, map known service/provider errors to HTTP responses, and return structured response models.
- `backend/app/services` owns workflow orchestration only: single-label processing, batch processing, and timing.
- `backend/app/providers/openai` owns OpenAI-specific extraction concerns: client reuse, prompt text, image payload formatting, structured response parsing, provider errors, and extraction concurrency.
- `backend/app/image_processing` owns upload validation and in-memory preprocessing: metadata/content checks, size and pixel limits, EXIF orientation handling, RGB conversion, resize, and JPEG compression.
- `backend/app/verification` owns deterministic field comparison and response field-result construction.
- `backend/app/utils` holds generic helpers such as text normalization and logging setup.
- `backend/app/config.py` is the only backend environment/configuration source used by routes and services.
- Uploaded images are processed in memory and are not permanently stored.
- There is no extraction result cache in this MVP. With a Vercel frontend and Render backend, avoiding persistent
  extraction storage keeps deployment simple, avoids retention questions, and fits Render's default ephemeral
  filesystem behavior. OpenAI client objects are still cached in memory to avoid repeated SDK setup overhead.

## Product Framing

AI extracts visible label text. Backend code verifies fields deterministically. The app assists label review but does not make final legal compliance determinations.
