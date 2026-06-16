# Requirements Mapping

This table maps the take-home deliverables and reviewer needs to the current repository documentation and implementation.

| Requirement / Need | Where Addressed | Notes |
| --- | --- | --- |
| Source code repository | Repository root, `frontend/`, `backend/`, `scripts/`, `docs/` | Source code and documentation are contained in this repository. Public repository URL: https://github.com/nicolasgioanni/label-compliance-verifier. |
| README with setup and run instructions | [../../README.md](../../README.md), [setup-and-run.md](setup-and-run.md) | README provides the short path; the setup guide provides detailed commands. |
| Brief documentation of approach, tools, and assumptions | [project-brief.md](project-brief.md), [engineering-decisions.md](engineering-decisions.md), [../../README.md](../../README.md) | Covers problem, approach, tools, assumptions, tradeoffs, and limitations. |
| Deployed application URL | [deployment-links.md](deployment-links.md), [../../README.md](../../README.md), [../../REVIEWER_GUIDE.md](../../REVIEWER_GUIDE.md) | Public frontend and backend URLs are listed for evaluator review. |
| Working prototype accessible for testing | [../../REVIEWER_GUIDE.md](../../REVIEWER_GUIDE.md), [setup-and-run.md](setup-and-run.md) | Deployed review uses the public frontend. Local review uses `.\scripts\start-dev.ps1` after dependency setup and backend provider key configuration. |
| Label image upload | `frontend/src/components/verification/VerificationForm.jsx`, `frontend/src/utils/fileValidation.js` | Supports JPG/JPEG, PNG, WebP, and TIFF/TIF uploads with client validation. |
| Backend upload validation | `backend/app/image_processing/validation.py` | Validates extension, MIME type, decoded image content, non-empty content, size, readability, and pixel count. |
| Image preprocessing | `backend/app/image_processing/preprocessor.py` | Processes uploads in memory before extraction. |
| Label field extraction | `backend/app/providers/openai/extraction.py` | Uses the backend OpenAI vision-model integration. The frontend never calls OpenAI directly. |
| Selected field verification | `backend/app/verification/rules.py` | Verifies brand name, class or type, alcohol content, net contents, bottler/producer, country of origin, and government warning text. |
| Simple reviewer workflow | `frontend/src/App.jsx`, `frontend/src/components/verification/VerificationForm.jsx`, `frontend/src/components/queue/` | The interface centers on upload, queue, expected data entry, result review, and export. |
| Clear match and mismatch results | `backend/app/schemas.py`, `frontend/src/components/verification/FieldResultCard.jsx`, `frontend/src/components/verification/SelectedResultDetail.jsx`, `frontend/src/utils/statusStyles.js` | Backend returns structured statuses; frontend formats them for review. |
| Queue support | `frontend/src/hooks/useQueueVerification.js`, `frontend/src/utils/fileValidation.js` | Frontend queues up to 10 labels and verifies ready labels by calling `/verify` per ready item. |
| Batch endpoint | `backend/app/routes/verification.py`, `backend/app/services/batch_service.py` | Backend exposes `/verify-batch` for shared expected fields. The current frontend does not call it. |
| Export results | `frontend/src/utils/resultExport.js` | Exports current non-stale verification results to CSV or XLSX. Raw extracted text is not exported. |
| Error handling | [../architecture/error-handling.md](../architecture/error-handling.md), `backend/app/routes/verification.py`, `frontend/src/components/shared/ErrorBanner.jsx` | Known backend failures map to safe API errors; frontend displays upload, service, and per-label errors. |
| Security and privacy choices | [../security.md](../security.md), [../development/security-and-privacy.md](../development/security-and-privacy.md) | Documents backend-only provider keys, upload validation, temporary processing, CORS, and production considerations. |
| Tradeoffs and limitations | [project-brief.md](project-brief.md), [engineering-decisions.md](engineering-decisions.md), [../../README.md](../../README.md) | Documents non-goals, extraction limits, deployment-tier latency, and prototype scope. |
| API documentation | [../api/overview.md](../api/overview.md), [../api/endpoints.md](../api/endpoints.md), [../api/request-response-contracts.md](../api/request-response-contracts.md) | Documents `GET /health`, `POST /warmup`, `POST /verify`, and `POST /verify-batch`. |
| Testing and validation documentation | [setup-and-run.md](setup-and-run.md), [../development/testing-and-validation.md](../development/testing-and-validation.md) | Lists frontend and backend validation commands and manual smoke checks. |
