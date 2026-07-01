# Reviewer Guide

This guide is the shortest path for evaluating Compliance Label Assistant. It is written for reviewers who want to open the deployed prototype, run a few representative cases, and understand what is intentionally out of scope.

## Quick Links

| Resource | Link |
| --- | --- |
| Landing page | https://compliance-label-assistant.vercel.app |
| Verification tool | https://compliance-label-assistant.vercel.app/app |
| About page | https://compliance-label-assistant.vercel.app/about |
| Privacy Policy | https://compliance-label-assistant.vercel.app/privacy |
| Terms of Use | https://compliance-label-assistant.vercel.app/terms |
| License | https://compliance-label-assistant.vercel.app/license |
| Backend API | https://compliance-label-assistant.onrender.com |
| Source repository | https://github.com/nicolasgioanni/Compliance-Label-Assistant |
| Release and deployment links | [docs/take-home/deployment-links.md](docs/take-home/deployment-links.md) |
| Sample labels | [sample-data/README.md](sample-data/README.md) |
| Full documentation index | [docs/README.md](docs/README.md) |

The deployed frontend does not require a test account. The deployed backend is configured separately from the repository. Provider keys, dashboard links, tokens, and credentials are not included here.

## What To Test First

1. Open https://compliance-label-assistant.vercel.app.
2. Confirm the backend status indicator is online.
3. Add one JPG/JPEG, PNG, WebP, or TIFF/TIF label image.
4. Enter expected application data for the selected label.
5. Run verification.
6. Review field-level results, extracted values, reasons, and timing details.
7. Add multiple labels to the queue.
8. Give each ready label its own expected application data.
9. Verify ready labels.
10. Export current results to CSV or XLSX.

Synthetic labels and manual expected inputs are available in [sample-data/README.md](sample-data/README.md).

## Suggested Test Cases

- Valid label with matching fields.
- Brand capitalization difference.
- Alcohol content mismatch.
- Missing government warning.
- Warning heading title case instead of uppercase.
- Queue with one ready label and one incomplete label.
- Unsupported file type or oversized image.

## Expected Behavior

- Field-level statuses appear for supported fields.
- Missing or mismatched fields are flagged.
- Human review remains final.
- Queue items can have separate expected application data.
- The ready-label workflow verifies only labels with complete required data.
- CSV and XLSX exports contain result summary fields for current non-stale results.
- Raw extracted text is not included in export files.
- Backend setup or provider-key errors are shown clearly to the reviewer.

## Supported Verification Fields

- Brand name
- Class or type
- Alcohol content
- Net contents
- Bottler/producer
- Country of origin
- Government warning

Government warning verification is strict for extracted text: the backend checks the uppercase `GOVERNMENT WARNING:` heading and standard warning wording. The prototype does not make final determinations about warning typography, boldness, font size, placement, or full label layout.

## What Is Out Of Scope

- COLA integration
- COLA PDF ingestion
- Final legal compliance decisions
- Official government review workflow
- Persistent upload storage
- Authentication
- Database
- Audit logging
- Document retention
- Full warning typography or placement verification
- Large background batch processing for hundreds of labels

## Local Setup

Recommended setup from the repository root:

```powershell
git clone https://github.com/nicolasgioanni/Compliance-Label-Assistant.git
cd Compliance-Label-Assistant
.\scripts\setup-local.ps1
```

Add a backend provider key to ignored `backend\.env`:

```text
OPENAI_API_KEY=<OPENAI_API_KEY>
```

Start both services:

```powershell
.\scripts\start-dev.ps1
```

Local URLs:

- Frontend landing page: `http://localhost:5173`
- Frontend verification tool: `http://localhost:5173/app`
- Frontend about page: `http://localhost:5173/about`
- Frontend privacy policy: `http://localhost:5173/privacy`
- Frontend terms of use: `http://localhost:5173/terms`
- Frontend license: `http://localhost:5173/license`
- Backend API: `http://127.0.0.1:8000`
- Health check: `http://127.0.0.1:8000/health`

Manual setup details are in [docs/take-home/setup-and-run.md](docs/take-home/setup-and-run.md).

## Required Environment Variables

Frontend:

- `VITE_API_BASE_URL`: backend API base URL used by browser requests.

Backend:

- `OPENAI_API_KEY`: backend-only provider key required for verification requests.
- `ALLOWED_ORIGINS`: comma-separated browser origins allowed by CORS.

The frontend must not receive `OPENAI_API_KEY` or other provider secrets.

## Architecture Summary

- The frontend is a React and Vite browser app deployed on Vercel.
- The backend is a FastAPI service deployed on Render.
- The frontend calls `GET /health`, `POST /warmup`, and `POST /verify`.
- The backend also exposes `POST /verify-batch`, but the current frontend does not call it.
- OpenAI extraction runs on the backend only.
- Deterministic backend verification rules produce the field-level statuses.
- Uploaded images are validated and processed temporarily by application code; they are not persistently stored.

## Useful Links

- [README](README.md)
- [Take-home project brief](docs/take-home/project-brief.md)
- [Engineering decisions](docs/take-home/engineering-decisions.md)
- [Requirements mapping](docs/take-home/requirements-mapping.md)
- [API documentation](docs/api/overview.md)
- [Security documentation](docs/security.md)
