# Take-Home Project Brief

## Problem

Compliance reviewers manually compare alcohol label artwork against expected application data. That work can be slow, especially when reviewers need to check repeated fields across multiple labels. This prototype focuses on assisting routine comparison by showing selected field matches, mismatches, missing values, and manual-review cases in one browser workflow.

I treated the assignment as a standalone proof of concept. The app does not integrate with COLA, does not ingest COLA PDFs, and does not make final legal compliance decisions.

## Implemented Scope

- Frontend queue for up to 10 label images.
- JPG/JPEG, PNG, WebP, and TIFF/TIF image upload support.
- Client-side and backend upload validation.
- Expected field entry for brand name, class or type, alcohol content, net contents, bottler/producer, and country of origin.
- Automatic use of the standard government warning text.
- In-memory image preprocessing with Pillow.
- Backend OpenAI vision-model extraction for visible label fields.
- Deterministic backend verification rules for selected fields.
- Field-level statuses: `pass`, `normalized_match`, `fail`, `missing`, `needs_review`, and `error`.
- Overall statuses: `pass`, `fail`, and `error`.
- Frontend verification for one selected label or all ready labels in the queue.
- Backend endpoints for `GET /health`, `POST /warmup`, `POST /verify`, and `POST /verify-batch`.
- CSV and XLSX export for current non-stale verification results.
- User-facing error handling for upload, connectivity, validation, provider configuration, and verification failures.

The current frontend calls `GET /health`, `POST /warmup`, and `POST /verify`. The backend `/verify-batch` endpoint exists for shared expected fields, but the current frontend does not call it.

## Non-Goals

- COLA integration
- COLA PDF ingestion
- Final legal compliance determination
- Exhaustive validation of every federal alcohol labeling requirement
- Authentication or reviewer accounts
- Admin dashboard
- Database
- Audit logging
- Persistent upload storage
- Document retention
- Official government deployment posture

## Technical Approach

The frontend is a React and Vite application under `frontend/`. It owns upload interaction, queue state, expected field forms, result display, filtering, export actions, and API calls through `frontend/src/api/verificationApi.js`.

The backend is a FastAPI application under `backend/`. Route handlers accept HTTP input and delegate validation, preprocessing, extraction, verification, and response assembly to service modules.

I separated extraction from verification so the AI handles visual text extraction while deterministic backend logic handles pass, fail, missing, and needs-review decisions. That boundary keeps comparison behavior explainable and makes the verification rules easier to test.

## Tools Used

- React 18 and Vite 6 for the frontend.
- JavaScript and CSS for frontend source.
- FastAPI, Uvicorn, and Pydantic for the backend API.
- Python 3.11 for backend runtime.
- OpenAI Python SDK for backend-only vision-model extraction.
- Pillow for image validation and preprocessing.
- Vitest, Testing Library, and ESLint for frontend validation.
- pytest and Ruff for backend validation.
- `write-excel-file` for XLSX export and browser-generated CSV.
- Vercel frontend deployment and Render Starter backend deployment.

## Assumptions

- Reviewers provide expected application field values before verification.
- Uploaded test images are non-sensitive and suitable for prototype evaluation.
- Human review remains final for ambiguous or low-confidence cases.
- The selected fields are enough to demonstrate the workflow.
- Local development runs the frontend on `http://localhost:5173` and the backend on `http://127.0.0.1:8000`.
- Provider credentials are configured only in the backend environment.
- Uploaded files should be processed temporarily and not persistently stored by application code.

## Tradeoffs

- I used OpenAI vision extraction because varied label images can be difficult for local OCR, but that introduces provider cost, outbound network traffic, and government deployment review questions.
- I intentionally avoided authentication, persistence, audit controls, and retention workflows because those need product and compliance decisions beyond this prototype.
- The frontend queue calls `POST /verify` per ready label so each label can have separate expected application data.
- Image preprocessing reduces payload size and latency, but poor image quality can still affect extraction accuracy.
- CSV and XLSX export give reviewers a practical summary without adding backend reporting endpoints or stored report history.

## Limitations

- Extraction may be inaccurate for glare, blur, poor lighting, unusual layouts, curved labels, or very small text.
- Government warning verification checks extracted text for the uppercase heading and standard wording, but it does not decide typography, boldness, font size, placement, or full label-layout compliance.
- The app does not evaluate every federal alcohol labeling requirement.
- The current implementation does not persist historical results or final human decisions.
- The prototype is not designed for restricted government network operation without review of provider approval, network egress, retention, audit logging, access control, and monitoring.

## Future Work

- Measure extraction quality across a larger labeled dataset.
- Expand supported fields and label types.
- Improve confidence scoring and manual-review explanations.
- Add stronger handling for poor-quality images.
- Add production authentication, authorization, audit logging, retention controls, and access controls.
- Research COLA integration requirements and constraints.
- Add a frontend workflow that uses backend batch verification where shared expected fields are appropriate.
- Add deployment health checks and monitoring outside the application code.
