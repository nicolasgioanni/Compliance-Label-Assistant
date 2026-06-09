# Engineering Decisions

This document explains the main interpretation, assumptions, design choices, and trade-offs behind the take-home prototype. It is written for evaluators who want to understand how the implementation was scoped and why specific technical decisions were made.

## Project Interpretation

The project was interpreted as a standalone alcohol label verification prototype, not as a replacement for COLA and not as a complete government compliance system. The core workflow is routine comparison: a reviewer provides expected application fields, uploads label artwork, and receives structured results showing where the visible label content appears to match, differ, be missing, or require human review.

The implementation keeps human review as the final decision point. The system assists with selected field matching, but it does not issue official compliance determinations.

## Decision Principles

- Keep the prototype focused on the business problem described by the take-home assignment: routine comparison of label artwork against expected application data.
- Separate visual text extraction from verification so comparison decisions remain explicit and testable.
- Keep secrets and provider calls on the backend.
- Avoid persistent storage unless the product scope requires retention, accounts, audit history, or review workflow state.
- Favor a simple reviewer workflow over a broad feature set.
- Document limitations clearly rather than implying production compliance readiness.

## Core Assumptions

| Assumption | Rationale | Impact on implementation |
| --- | --- | --- |
| Reviewers upload label artwork images. | The take-home assignment focuses on label artwork and does not require direct COLA integration or COLA PDF ingestion. | The app accepts JPG, PNG, WebP, and TIFF image uploads. COLA PDFs and direct COLA records are out of scope. |
| Expected application data is entered by the user. | No COLA API, database, or application-record source is required by the assignment. | Reviewers enter expected values for brand name, class or type, alcohol content, net contents, bottler/producer, and country of origin; the standard government warning is applied automatically. |
| Human review remains final. | Label review contains nuance, especially for capitalization, punctuation, image quality, and legal interpretation. | Results include field-level statuses rather than a single irreversible decision. |
| Government warning text should be stricter than general label text. | The warning statement is a specific regulated text area and is less tolerant of formatting and wording variation than ordinary brand text. | Warning text is verified separately and documented as stricter than normalized brand or class matching. |
| Uploaded files should not be persisted by application code. | Persistent storage would introduce retention, privacy, and audit-design questions that are outside the prototype scope. | Files are validated and processed in memory. No database or uploaded-file storage is included. |
| Cloud extraction is acceptable for a prototype, but not automatically production-ready for restricted environments. | A vision provider improves prototype extraction quality, while production government infrastructure may require approved network and provider controls. | The OpenAI integration is isolated behind backend provider modules and configured with backend-only environment variables. |
| Speed matters, but guaranteed latency is not claimed. | A slow reviewer tool is unlikely to be adopted, but provider latency and deployment tier are not fully controlled by the app. | The backend resizes and compresses images, and the queue uses bounded concurrency. Documentation avoids promising a fixed response time. |
| Batch handling should be bounded. | Reviewers may need to process multiple labels, but unrestricted batch processing could increase cost, latency, and failure complexity. | The frontend queue is limited to 10 labels, and backend batch size is configurable with `MAX_BATCH_SIZE`. |

## Major Decisions And Alternatives

### Full-Stack App Instead Of A Single-Tool Prototype

The project uses a React and Vite frontend with a FastAPI backend instead of a single hosted notebook or Streamlit-style prototype. A full-stack structure better demonstrates the real product boundaries required for this problem: browser upload workflow, backend-only provider secrets, API contracts, upload validation, image preprocessing, verification logic, and deployment separation.

The trade-off is more setup and deployment surface than a single-process prototype. That extra structure is intentional because the take-home assignment asks for a working prototype that can be evaluated as source code and deployed application behavior, not just a local demonstration.

### React And Vite Instead Of Next.js

The frontend is a static client application. It handles upload state, queue state, expected field entry, result review, and export actions. It does not need server-side rendering, file-system routing, server actions, or frontend-hosted backend routes.

React and Vite keep the frontend lightweight and well-suited to Vercel static deployment. Next.js would add capabilities that are not needed by the current prototype.

### FastAPI Instead Of Django Or Flask

The backend is an API service rather than a database-heavy web application. It exposes health, warmup, single-label verification, and batch verification endpoints. It also performs upload validation, image preprocessing, provider extraction, deterministic verification, and structured response assembly.

FastAPI fits this shape because it supports typed request handling, Pydantic schemas, clear route organization, and async-friendly service boundaries. Django would be heavier than the current scope because the app has no database, admin panel, authentication, or server-rendered pages. Flask could work, but FastAPI provides stronger structure for documented JSON APIs and typed response models.

### OpenAI Extraction Instead Of Local OCR

The prototype uses a backend OpenAI vision-model integration for extraction instead of local OCR. The reason is reliability for varied label images, including glare, rotation, low light, small text, and non-uniform layouts. Local OCR can be useful, but it often depends on clean text regions and can add deployment friction through system-level OCR binaries.

The trade-off is an external provider dependency, cost, outbound network access, and provider-key management. The implementation mitigates that by keeping the key backend-only and isolating provider-specific logic under the backend provider boundary. A production government deployment could replace that boundary with an approved OCR or vision provider.

### Extraction Separate From Verification

The backend does not ask the provider to decide whether a label is compliant. The provider extracts visible label fields. Backend verification code then compares extracted values against expected values using deterministic rules.

This separation makes the system easier to test and explain. It also reduces the risk that an opaque model response becomes the source of pass or fail decisions. The result is a clearer boundary: extraction is probabilistic, while comparison rules are code-owned and auditable.

### Backend-Only Provider Key

The frontend receives only the backend API base URL through `VITE_API_BASE_URL`. Provider credentials are configured only in the backend environment, primarily through `OPENAI_API_KEY`.

This protects the provider key from browser exposure and keeps provider usage controlled by backend validation, preprocessing, timeout, concurrency, and error-handling rules.

### No Database Or Persistent File Storage

The prototype does not include a database, account system, review history, audit trail, or persistent upload storage. This keeps the implementation smaller and reduces unnecessary retention risk for a take-home prototype.

The trade-off is that review history and manual final decisions are not saved. Those capabilities would require product decisions about user identity, retention rules, audit requirements, access control, and official review workflow.

### Queue-Based Workflow

The frontend uses a queue-based workflow rather than separate single and batch pages. One queued label supports the single-label path, while multiple queued labels support batch-style review. Each queued label can have its own expected field values, which is closer to how reviewers may handle different applications.

The queue currently verifies ready labels by calling `POST /verify` for each ready item. The backend also exposes `POST /verify-batch`, but that endpoint uses shared expected fields and is not called by the current frontend. Keeping the queue on single-label calls avoids changing the backend API contract and supports per-label expected data.

### Bounded Batch Size And Concurrency

The queue limit and concurrency settings are intentionally bounded. This protects the prototype from uncontrolled provider cost, long browser sessions, and difficult partial-failure behavior.

The trade-off is that the prototype does not process hundreds of labels in one run. A production workflow for large importer submissions would likely need CSV import, background jobs, durable progress tracking, retry management, monitoring, and stronger access control.

### CSV And XLSX Export

The frontend exports current verification results to CSV and XLSX. This gives reviewers a practical way to inspect or share field-level outcomes without adding backend reporting endpoints or persistence.

The export is intentionally limited to current result data. It does not include raw uploaded images, raw provider payloads, or a persistent report history.

### No Separate Landing Page

The deployed application should open directly into the working tool. Evaluators need to test the prototype quickly, so a separate marketing-style landing page would add friction without improving the take-home deliverable.

## Matching Strategy

The verification rules are field-specific. Brand and class or type comparisons can produce normalized matches when differences are limited to capitalization, punctuation, or similar low-risk text variation. Alcohol content and net contents use parsing and normalization so equivalent representations can be compared more consistently.

Government warning verification is strict for extracted text: the backend checks presence, uppercase `GOVERNMENT WARNING:` heading, and exact standard wording. The prototype does not make final typography, boldness, font-size, placement, or label-layout determinations; those remain human-review items.

## Development Approach

The implementation followed a vertical-slice approach so each phase produced a working path before adding broader capability.

1. The scaffold established the repository structure, FastAPI app entrypoint, frontend app shell, health path, and basic frontend-to-backend connectivity.
2. The extraction pipeline added upload validation, in-memory image preprocessing, provider integration, structured extracted fields, and safe provider error handling.
3. Deterministic verification added field normalization, alcohol-content comparison, net-content comparison, government warning checks, overall status aggregation, and backend tests.
4. The queue workflow added multiple-file handling, per-label expected data, selected-label verification, ready-label verification, queue state, partial errors, and result review.
5. Export and evaluator support added CSV and XLSX result export, synthetic fixture data, automated fixture tests, setup docs, deployment docs, and take-home documentation.
6. Documentation and polish clarified architecture, security boundaries, performance considerations, limitations, and reviewer setup paths.

This phased approach reduced integration risk by proving each runtime boundary before expanding the product surface.

## Security And Privacy Boundaries

The prototype includes security choices appropriate to the take-home scope:

- Provider secrets stay in backend environment variables.
- The frontend does not call the provider directly.
- Uploaded files are validated before extraction.
- Images are processed in memory and are not persistently stored by application code.
- CORS is configured through backend environment settings.
- Export utilities avoid raw extracted text and neutralize spreadsheet formula prefixes.
- User-provided and extracted text is rendered as text, not as raw HTML.

The prototype does not include production controls such as authentication, role-based access, audit logging, retention policy, rate limiting, production monitoring, or federal compliance hardening.

## Production Considerations

The current implementation is intentionally a proof of concept. A production version would need additional decisions before handling sensitive applicant data or operating in a restricted government environment.

Important future work includes:

- Approved OCR or vision-provider review.
- Network egress and deployment-environment review.
- Authentication and role-based access.
- Audit logging and official review history.
- Data retention and deletion policy.
- Larger batch processing through background jobs.
- Monitoring, alerting, and operational dashboards.
- Broader field coverage and validation against additional alcohol labeling requirements.
- Measured extraction-quality evaluation across a larger labeled test set.

These items are not implemented in the current prototype and should not be treated as current capabilities.
