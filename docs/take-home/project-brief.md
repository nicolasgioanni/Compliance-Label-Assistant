# Take-Home Project Brief

## Problem

Compliance reviewers manually compare alcohol label artwork to expected application fields. Routine matching work is time-consuming, and a slow or unclear tool is unlikely to help in practice. This prototype focuses on speeding up routine verification by showing selected field matches, mismatches, and manual-review cases in a simple interface.

## Goals

- Provide fast label verification assistance for selected alcohol label fields.
- Keep the user interface simple enough for quick review.
- Show clear field-level and overall verification results.
- Support key fields currently implemented in code: brand name, class or type, alcohol content, net contents, bottler/producer, country of origin, and government warning.
- Support prototype-level local development and cloud deployment.
- Keep frontend, backend, extraction, image processing, and verification concerns separated.

## Non-Goals

- No direct COLA integration.
- Not a production federal compliance system.
- Not a replacement for human judgment.
- Not exhaustive validation of every TTB regulation.
- No authentication, admin dashboard, database, or persistent uploaded file storage.
- No storage of sensitive production application data by the application code.

## Implemented Features

- Frontend queue for up to 10 label images.
- Client-side validation for JPG, PNG, WebP, and TIFF uploads up to 5 MB.
- Expected field entry for brand name, class or type, alcohol content, net contents, bottler/producer, country of origin, and government warning.
- Backend upload validation for file type, size, and image dimensions.
- In-memory image preprocessing with Pillow.
- Backend OpenAI vision-model extraction for visible label fields.
- Deterministic backend comparison rules for selected fields.
- Field-level response statuses: `pass`, `normalized_match`, `fail`, `missing`, `needs_review`, and `error`.
- Overall response statuses: `pass`, `fail`, and `error`.
- Frontend verification for one selected label or all ready labels in the queue.
- Backend single-label endpoint at `POST /verify`.
- Backend shared expected-field batch endpoint at `POST /verify-batch`.
- Frontend health check and warmup calls at `GET /health` and `POST /warmup`.
- CSV and XLSX export for current verification results.
- User-facing error handling for upload, connectivity, validation, and verification failures.

## Technical Approach

For a deeper explanation of the architecture choices, alternatives considered, assumptions, and trade-offs, see [Engineering Decisions](engineering-decisions.md).

### Frontend

The frontend is a React and Vite application under `frontend/`. It owns the upload user interface, queue state, expected field forms, API calls, result display, filtering, and exports. API calls are centralized in `frontend/src/api/verificationApi.js`.

### Backend

The backend is a FastAPI application under `backend/`. Route handlers accept HTTP input, then delegate validation, image preprocessing, extraction, verification, and response assembly to service modules.

### Image Processing

The backend validates upload metadata and image content before preprocessing. Images are normalized in memory with Pillow, including orientation handling, resizing, RGB conversion, and JPEG encoding according to backend configuration.

### Extraction

The provider-specific extraction boundary lives under `backend/app/providers/openai/`. The backend sends the preprocessed image to the configured OpenAI vision model and parses the structured field output into backend schemas.

### Verification

Verification rules live under `backend/app/verification/`. They compare expected and extracted fields with deterministic logic for exact matches, normalized text matches, numeric alcohol content, net content units, and government warning text.

### Error Handling

Known upload, preprocessing, provider configuration, provider response, and provider service failures are mapped to safe API responses. The frontend displays user-facing error messages and stores per-label verification failures in queue item state.

### Performance and Cost

The system reduces provider payload size through image preprocessing and configurable image detail settings. Frontend queue verification uses a fixed concurrency of 2 ready labels. Backend batch verification uses configurable batch limits and concurrency.

## Tools Used

- React 18 and Vite 6 for the frontend.
- JavaScript and CSS for frontend source.
- FastAPI, Uvicorn, and Pydantic for the backend API.
- Python 3.11 for backend runtime.
- OpenAI Python SDK for vision-model extraction.
- Pillow for image validation and preprocessing.
- Vitest, Testing Library, and ESLint for frontend validation.
- pytest and Ruff for backend validation.
- `write-excel-file` for XLSX export.
- Vercel frontend deployment and Render Starter backend deployment are the intended deployment targets.

## Assumptions Made

- Reviewers provide expected application field values before verification.
- Uploaded test images are non-sensitive and suitable for prototype evaluation.
- Human review remains final for ambiguous or low-confidence cases.
- The selected fields are enough to demonstrate the prototype workflow.
- Local development runs the frontend on `http://localhost:5173` and the backend on `http://127.0.0.1:8000`.
- The backend provider key is configured only on the backend.

## Trade-Offs

- Speed vs accuracy: resized images reduce payload size and latency, but tiny text or poor image quality may become harder to extract.
- Prototype simplicity vs production hardening: the app avoids authentication, persistence, audit controls, and deployment-specific security controls that a production system would need.
- OpenAI extraction vs deterministic verification: extraction handles visual text recognition, while deterministic rules keep comparison behavior explicit and testable.
- Frontend queue compared with backend batch: the user interface currently verifies ready labels by calling `POST /verify` per label; the backend also exposes `POST /verify-batch` for shared expected fields.
- Cloud provider use vs restricted environments: the prototype uses an external provider integration and is not designed for restricted government network operation.

## Limitations

- Deployed URLs are not currently documented in the repository and must be added before submission.
- Extraction may be inaccurate for glare, blur, poor lighting, unusual layouts, curved labels, or very small text.
- Government warning verification checks extracted text, not typography, placement, or label formatting.
- The system does not evaluate every federal alcohol labeling requirement.
- The current implementation does not persist historical results.
- The frontend does not call the backend `/verify-batch` endpoint.
- Provider latency and Render Starter cold starts can affect user-perceived speed.

## Future Improvements

- Add measured extraction quality evaluation across a larger labeled dataset.
- Expand supported fields and label types.
- Improve confidence scoring and manual-review explanations.
- Add stronger handling for poor-quality images.
- Add production authentication, audit, retention, and access controls.
- Research COLA integration requirements and constraints.
- Add a frontend workflow that uses backend batch verification where shared expected fields are appropriate.
- Add deployment health checks and monitoring outside the application code.
