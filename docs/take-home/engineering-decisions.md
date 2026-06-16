# Engineering Decisions

This document explains how I scoped the take-home prototype and why I made the main technical choices. It is intended for evaluators who want more detail than the README without reading every implementation file.

## Project Interpretation

I interpreted the assignment as a standalone alcohol label verification prototype, not a COLA integration and not a complete government compliance system. The core workflow is routine comparison: a reviewer provides expected application fields, uploads label artwork, and receives structured results showing where visible label content appears to match, differ, be missing, or require human review.

Human review remains the final decision point. The system assists with selected field matching, but it does not issue official compliance determinations.

## Decision Principles

- Keep the prototype focused on routine comparison of label artwork against expected application data.
- Separate visual text extraction from deterministic verification.
- Keep provider secrets and provider calls on the backend.
- Avoid persistent storage unless the product scope requires retention, accounts, audit history, or review workflow state.
- Favor a simple reviewer workflow over a broad feature set.
- Document limitations clearly and avoid implying production compliance.

## Core Assumptions

| Assumption | Rationale | Implementation impact |
| --- | --- | --- |
| Reviewers upload label artwork images. | The assignment does not require direct COLA integration or COLA PDF ingestion. | The app accepts JPG/JPEG, PNG, WebP, and TIFF/TIF image uploads. |
| Expected application data is entered by the reviewer. | No COLA API, database, or application-record source is required. | The frontend provides expected field forms, and each queued label can keep separate expected data. |
| Human review remains final. | Label review includes legal interpretation and image-quality nuance. | Results are field-level evidence, not final compliance decisions. |
| Government warning text should be stricter than general label text. | The warning statement is a specific required text area. | The backend checks the uppercase heading and standard wording separately from general text normalization. |
| Uploaded files should not be persisted by application code. | Persistent storage would introduce retention, privacy, and audit-design questions. | Files are validated and processed in memory. No database or uploaded-file storage is included. |
| Cloud extraction is acceptable for a prototype. | A vision model improves extraction quality for varied label images. | The OpenAI integration is isolated behind backend provider modules and backend-only environment variables. |
| Batch handling should be bounded. | Unrestricted batch processing could increase cost, latency, and failure complexity. | The frontend queue is limited to 10 labels, and backend batch size is configurable. |

## Full-Stack Prototype

I built a React and Vite frontend with a FastAPI backend instead of a single notebook or one-process demo. That structure better represents the boundaries this problem needs: browser upload workflow, backend-only provider secrets, upload validation, image preprocessing, API contracts, deterministic verification logic, and separate deployment targets.

The tradeoff is more setup surface than a single-process prototype. I accepted that tradeoff because the take-home asks for a working deployed prototype and source code that reviewers can evaluate.

## Frontend Choice

The frontend is a static React and Vite application. It handles upload state, queue state, expected field entry, result review, and export actions. It does not need server-side rendering, file-system routing, server actions, or frontend-hosted backend routes.

This keeps the browser app small and appropriate for Vercel static deployment.

## Backend Choice

The backend is an API service rather than a database-backed web application. It exposes health, warmup, single-label verification, and shared expected-field batch verification endpoints. It also performs upload validation, image preprocessing, provider extraction, deterministic verification, and structured response assembly.

FastAPI fits this shape because it supports typed request handling, Pydantic schemas, clear route organization, and async-friendly service boundaries. Django would add database and admin concepts that the prototype does not use. Flask could work, but FastAPI gives stronger structure for the documented JSON contracts.

## OpenAI Extraction Boundary

The prototype uses a backend OpenAI vision-model integration for extraction instead of local OCR. I chose that route because varied label images can include glare, rotation, low light, small text, and non-uniform layouts.

The tradeoff is an external provider dependency, provider cost, outbound network access, and key management. The implementation limits that risk by keeping the key backend-only and isolating provider-specific code under `backend/app/providers/openai/`. A production government deployment could replace that boundary with an approved OCR or AI provider.

## Extraction Separate From Verification

The backend does not ask the model to decide whether a label passes. The model extracts visible label fields. Backend verification code compares those extracted values against expected values using deterministic rules.

This separation makes the results easier to explain and test. It also reduces the risk that an opaque model response becomes the source of pass or fail decisions.

## Backend-Only Provider Key

The frontend receives only `VITE_API_BASE_URL`. Provider credentials are configured only in the backend environment, primarily through `OPENAI_API_KEY`.

This protects the provider key from browser exposure and lets the backend enforce validation, preprocessing, timeout, concurrency, and error-handling rules before provider use.

## No Database Or Persistent Upload Storage

I intentionally avoided a database, account system, review history, audit trail, and persistent upload storage for this prototype. Those capabilities would require decisions about user identity, retention, official review records, audit requirements, access control, and deletion policy.

The tradeoff is that review history and final human decisions are not saved. For a take-home proof of concept, that keeps the implementation smaller and reduces unnecessary retention risk.

## Queue Workflow

The frontend uses a queue-based workflow rather than separate single and batch pages. One queued label supports the single-label path, while multiple queued labels support batch-style review. Each queued label can have its own expected field values.

The queue currently verifies ready labels by calling `POST /verify` for each ready item. The backend also exposes `POST /verify-batch`, but that endpoint uses one shared expected field set and is not called by the current frontend.

## Export Scope

The frontend exports current verification results to CSV and XLSX. The export includes result summary fields and field statuses. It does not include raw uploaded images, raw provider payloads, raw extracted text, or persistent report history.

CSV export neutralizes formula-like prefixes before download.

## Matching Strategy

The verification rules are field-specific. Brand and class or type comparisons can pass after safe capitalization, spacing, or punctuation normalization. Alcohol content and net contents use parsing and unit normalization where possible.

Government warning verification is stricter. The backend checks for the uppercase `GOVERNMENT WARNING:` heading and exact standard wording in extracted text. Typography, boldness, font size, placement, and full label-layout review remain human-review items.

## Security And Privacy Boundaries

- Provider secrets stay in backend environment variables.
- The frontend does not call OpenAI directly.
- Uploaded files are validated before extraction.
- Images are processed in memory and are not persistently stored by application code.
- CORS is configured through `ALLOWED_ORIGINS`.
- User-provided and extracted text is rendered as text, not raw HTML.
- CSV export neutralizes formula-like prefixes and omits raw extracted text.

The prototype does not include production controls such as authentication, authorization, role-based access, audit logging, retention policy, malware scanning, monitoring, or long-running batch infrastructure.

## Production Considerations

A production government deployment would need additional review before handling sensitive applicant data or operating in a restricted environment. Important areas include:

- Approved OCR or AI provider infrastructure.
- Network egress controls for external ML endpoints.
- PII handling.
- Retention and deletion policy.
- Authentication and role-based access.
- Audit logging and official review history.
- Monitoring, alerting, and operational dashboards.
- Larger batch processing through background jobs.
- Broader field coverage and validation against additional alcohol labeling requirements.

These items are not implemented in the current prototype and should not be treated as current capabilities.
