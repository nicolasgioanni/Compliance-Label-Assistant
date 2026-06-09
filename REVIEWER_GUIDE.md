# Reviewer Guide

This guide is the shortest path for evaluating the prototype. The deeper implementation documentation remains in [docs/](docs/README.md).

## Deployed Prototype

| Target | URL |
| --- | --- |
| Frontend | https://compliance-label-assistant.vercel.app |
| Backend API | https://compliance-label-assistant.onrender.com |

The deployed frontend does not require a test account. The deployed backend is configured separately from the repository. No provider keys, dashboard links, tokens, or credentials are included here.

## Access And Key Expectations

- Deployed review: open the frontend URL and test the application in the browser.
- Local review: backend verification requires `OPENAI_API_KEY` in the backend environment.
- Frontend local configuration uses `VITE_API_BASE_URL` to point the browser app at the backend.
- No real environment files or secret values should be committed to the repository.

## Supported Verification Fields

The current prototype verifies these fields:

- Brand name
- Class or type
- Alcohol content
- Net contents
- Government warning

The app does not currently verify bottler or producer information, country of origin, label placement, font size, or full government-warning typography.

## Quick Smoke Test

1. Open https://compliance-label-assistant.vercel.app.
2. Confirm the backend status indicator is online.
3. Upload a supported alcohol label image.
4. Enter expected values for brand name, class or type, alcohol content, and net contents; the standard government warning is applied automatically.
5. Run verification for the selected label.
6. Review field-level statuses, extracted values, reasons, and processing time.
7. Queue multiple labels and run the ready-label workflow.
8. Export current results to CSV or XLSX.
9. Try an unsupported file type and confirm a user-facing validation message appears.

Synthetic labels and manual expected inputs are available in [sample-data/README.md](sample-data/README.md).

## Known Gaps

- No direct COLA integration.
- No COLA PDF ingestion.
- No authentication or reviewer accounts.
- No database.
- No audit trail.
- No persistent uploaded-file storage.
- No official or final legal compliance decision.
- No full typography, font-size, boldness, or placement verification for government warnings.
- No large-scale background job workflow for hundreds of labels.

## Useful Links

- [Take-home project brief](docs/take-home/project-brief.md)
- [Engineering decisions](docs/take-home/engineering-decisions.md)
- [Setup and run guide](docs/take-home/setup-and-run.md)
- [Requirements mapping](docs/take-home/requirements-mapping.md)
- [API documentation](docs/api/overview.md)
