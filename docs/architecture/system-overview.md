# System Overview

## Purpose

Compliance Label Assistant helps a reviewer compare alcohol label artwork against expected application data. The current workflow supports uploading label image files, entering expected field values per label, running backend verification, and reviewing field-level results.

The application does not provide a final legal compliance decision. It presents extracted evidence and deterministic comparison statuses for human review.

## Audience

The user interface is built for reviewers who need to compare label artwork against application values. The codebase is organized for contributors working on the React frontend, FastAPI backend, provider integration, deterministic verification rules, deployment, and tests.

## Major User Workflow

1. Open the frontend at `http://localhost:5173` or the deployed Vercel URL.
2. Add one or more JPG, PNG, WebP, or TIFF label images to the queue.
3. Select a label and enter expected application data.
4. Run verification for the selected label or all ready labels.
5. Review overall status, field results, extracted text fields, and processing time.
6. Export current verified queue results to CSV or Excel when needed.

## Major Technical Workflow

```mermaid
flowchart LR
  U[Reviewer] --> F[React and Vite frontend]
  F --> A[FastAPI backend]
  A --> V[Upload validation]
  V --> P[Image preprocessing]
  P --> O[OpenAI extraction provider]
  O --> R[Deterministic verification]
  R --> F
```

## Responsibilities

Frontend:

- Manages the label queue and selected label workspace.
- Performs client-side file validation before queue insertion.
- Calls backend endpoints through `frontend/src/api/verificationApi.js`.
- Stores backend responses as queue item evidence.
- Renders result summaries, field cards, extracted text, and export controls.

Backend:

- Provides health, warmup, single verification, and batch verification endpoints.
- Validates file metadata, MIME type, decoded image format, file size, and decoded pixel count.
- Applies in-memory image orientation, RGB conversion, resizing, and JPEG compression.
- Calls the OpenAI provider boundary for field extraction.
- Applies deterministic comparison rules and returns structured response models.

External provider:

- Receives preprocessed JPEG bytes from backend code only.
- Returns structured visible text fields for deterministic comparison.
- Does not make final pass/fail decisions in this application.
- Can be replaced later because provider-specific code is isolated behind the extraction boundary.

## Deployment Model

- Frontend: Vercel project with `frontend` as root, `npm run build`, and `dist` output.
- Backend: Render Starter web service with `backend` as root, Python 3.11, and Uvicorn startup.
- `frontend/vercel.json` defines lightweight static response headers. There are no checked-in Render, Docker, or CI config files.

## Runtime Assumptions

- Uploaded files are processed temporarily in memory and are not persisted.
- The frontend queue limit is 10 files.
- Backend `/verify-batch` requires 2 to `MAX_BATCH_SIZE` files.
- Backend provider configuration is read through `backend/app/config.py`.
- `OPENAI_API_KEY` is required for extraction-backed verification.
- `ALLOWED_ORIGINS` must include the active frontend origin for browser calls.
- Government production use would need PII, retention, audit logging, egress, approved-provider, access-control, monitoring, and rate-limit review.

## Intentionally Out Of Scope

- Final legal compliance judgment.
- Database storage.
- Authentication or user accounts.
- Admin dashboard.
- COLA integration.
- Persistent uploaded file storage.
- Production rate limiting.
- Production monitoring.
- PDF and HEIC/HEIF uploads.
- Visual layout checks such as font size, bold styling, and exact label placement.
