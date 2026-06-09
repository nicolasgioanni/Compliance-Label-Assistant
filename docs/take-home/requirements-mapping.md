# Requirements Mapping

This table maps the take-home deliverables and stakeholder needs to the current repository documentation and implementation.

| Requirement / Need | Where Addressed | Notes |
| --- | --- | --- |
| Source code repository | Repository root, `frontend/`, `backend/`, `scripts/`, `docs/` | Source code and documentation are contained in this repository. |
| README with setup and run instructions | [../../README.md](../../README.md), [setup-and-run.md](setup-and-run.md) | README provides the short path; the setup guide provides detailed commands. |
| Brief documentation of approach, tools used, and assumptions made | [project-brief.md](project-brief.md), [../../README.md](../../README.md) | Covers business problem, technical approach, tools, assumptions, trade-offs, and limitations. |
| Deployed application URL | [deployment-links.md](deployment-links.md), [../../README.md](../../README.md) | Current value is `To be added before submission` because no deployed URL is present in tracked repository documentation or config. |
| Working prototype accessible for testing | [setup-and-run.md](setup-and-run.md) | Local prototype can run with `.\scripts\start-dev.ps1` after dependency setup and backend provider key configuration. |
| Label image upload | `frontend/src/components/verification/VerificationForm.jsx`, `frontend/src/utils/fileValidation.js` | Supports JPG, PNG, WebP, and TIFF uploads with client validation. |
| Backend upload validation | `backend/app/image_processing/validation.py` | Validates content type, file size, image readability, and image dimensions. |
| Image preprocessing | `backend/app/image_processing/preprocessor.py` | Processes uploads in memory before extraction. |
| Label field extraction | `backend/app/providers/openai/extraction.py` | Uses the backend OpenAI vision-model integration. |
| Selected field verification | `backend/app/verification/rules.py` | Verifies brand name, class or type, alcohol content, net contents, and government warning text. |
| Simple user interface for reviewers | `frontend/src/App.jsx`, `frontend/src/components/verification/VerificationForm.jsx`, `frontend/src/components/queue/` | The user interface centers on queue, expected data entry, result review, and export actions. |
| Clear match/mismatch/manual-review style results | `backend/app/schemas.py`, `frontend/src/components/verification/FieldResultCard.jsx`, `frontend/src/components/verification/SelectedResultDetail.jsx`, `frontend/src/utils/statusStyles.js` | Backend returns structured statuses; frontend formats them for review. |
| Batch upload or queue support | `frontend/src/hooks/useQueueVerification.js`, `frontend/src/utils/fileValidation.js`, `backend/app/routes/verification.py` | Frontend queues up to 10 labels and verifies ready labels by calling `/verify`; backend also exposes `/verify-batch` for shared expected fields. |
| Export results | `frontend/src/utils/resultExport.js` | Exports current verification results to CSV or XLSX. |
| Performance sensitivity | [../architecture/performance-and-cost.md](../architecture/performance-and-cost.md), [project-brief.md](project-brief.md) | Image resizing, provider detail settings, and queue concurrency are documented. |
| Error handling | [../architecture/error-handling.md](../architecture/error-handling.md), `backend/app/routes/verification.py`, `frontend/src/components/shared/ErrorBanner.jsx` | Known backend failures map to API errors; frontend displays upload, service, and per-label errors. |
| Trade-offs and limitations | [project-brief.md](project-brief.md), [../../README.md](../../README.md) | Documents non-goals, extraction limits, deployment-tier latency, and prototype scope. |
| API documentation | [../api/overview.md](../api/overview.md), [../api/endpoints.md](../api/endpoints.md), [../api/request-response-contracts.md](../api/request-response-contracts.md) | Documents `GET /health`, `POST /warmup`, `POST /verify`, and `POST /verify-batch`. |
| Frontend documentation | [../frontend/overview.md](../frontend/overview.md) | Deep frontend implementation docs remain outside the evaluator summary. |
| Backend documentation | [../backend/overview.md](../backend/overview.md) | Deep backend implementation docs remain outside the evaluator summary. |
| Deployment documentation | [../deployment/overview.md](../deployment/overview.md), [../deployment/frontend-vercel.md](../deployment/frontend-vercel.md), [../deployment/backend-render.md](../deployment/backend-render.md) | Documents dashboard settings because no Vercel, Render, Docker, or CI config is checked in. |
| Testing and validation documentation | [setup-and-run.md](setup-and-run.md), [../development/testing-and-validation.md](../development/testing-and-validation.md) | Lists actual frontend and backend validation commands. |
