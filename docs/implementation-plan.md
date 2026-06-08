# Implementation Summary

## Overview

Compliance Label Assistant is a shipped prototype for AI-assisted alcohol label verification. The app extracts visible label text with OpenAI vision, compares extracted values against expected application data with deterministic backend rules, and presents explainable field-level results for human review.

The app does not make final legal compliance determinations, integrate with COLA, store uploaded files, or persist review history.

## Frontend

- React/Vite single-page app with a selected-label workspace and a queue for up to 10 JPG, PNG, WebP, or TIFF labels.
- Each queued label has its own expected field values, request status, backend result evidence, and selected workspace view.
- The frontend calls `/verify` once per ready queued label through `frontend/src/api/verificationApi.js`; ready-label verification uses frontend concurrency capped at 2 to keep latency and cost bounded.
- Queue badges, summary counts, filters, selected result detail, and exports use the backend `overall_status`.
- CSV and Excel exports are client-side only, skip unverified or stale results, and include filename, overall status, field statuses, and processing time.

## Backend

- FastAPI exposes `GET /health`, `POST /verify`, and `POST /verify-batch`.
- Routes stay thin: they parse multipart form inputs, build expected fields, call services, and return structured responses.
- Services own workflow orchestration: single-label verification, batch verification, and timing.
- `backend/app/providers/openai` owns OpenAI extraction, client reuse, prompt text, provider payloads, response parsing, and provider error mapping.
- `backend/app/image_processing` owns upload validation and in-memory image preprocessing.
- `backend/app/verification` owns deterministic field comparison and field-result construction.
- Utilities handle generic helpers such as text normalization and safe logging.
- Configuration is centralized in `backend/app/config.py`.

## Verification Pipeline

- Upload validation rejects unsupported extensions/MIME types, empty files, oversized files, pixel-count overflow, content-type mismatches, corrupt images, and duplicate batch basenames.
- Images are processed in memory, normalized for orientation, resized to `MAX_IMAGE_WIDTH`, and compressed to JPEG before extraction.
- OpenAI extraction returns structured fields only; it does not decide compliance.
- Backend verification compares brand name, class/type, alcohol content, net contents, and the standard government warning with deterministic rules.
- Status values are lowercase and explainable: `pass`, `normalized_match`, `fail`, `missing`, `needs_review`, and `error`.

## Security And Limits

- The OpenAI API key is backend-only and never exposed to frontend code.
- Uploaded image bytes are not permanently stored.
- CORS, model, timeout, upload size, pixel count, queue size, and batch settings are configurable through backend environment variables.
- No authentication, database, admin dashboard, COLA integration, or persistent uploaded file storage is included in the MVP.

## Checks

Backend:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m ruff check app
.\.venv\Scripts\python.exe -c "from app.main import app; print(app.title)"
```

Frontend:

```powershell
cd frontend
npm run lint
npm run typecheck
npm test
npm run build
```
