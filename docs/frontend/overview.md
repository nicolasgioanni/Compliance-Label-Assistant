# Frontend Overview

## Purpose

The frontend provides the browser workflow for label queue management, expected data entry, backend verification calls, result review, and export.

## Framework And Tooling

- React `18.3.1`
- Vite `6.4.3`
- JavaScript modules with JSX
- Vitest and Testing Library for tests
- ESLint flat config
- `write-excel-file` for browser Excel export

## Runtime Shape

- Single-page app without routing.
- Root HTML: `frontend/index.html`.
- React entrypoint: `frontend/src/main.jsx`.
- Application shell: `frontend/src/App.jsx`.
- Endpoint-aware code: `frontend/src/api/verificationApi.js`.

## Main Responsibilities

- Check backend health on load.
- Let reviewers add label files or supported folders.
- Track a queue of up to 10 active labels.
- Track expected application data per queue item.
- Call `/warmup` once after the first successful queue addition.
- Call `/verify` for selected or ready labels.
- Store backend responses as current or stale evidence.
- Render selected label status, field comparisons, extracted fields, and processing time.
- Export current verified queue results to CSV or Excel.

## Important Non-Responsibilities

- The frontend does not hold provider secrets.
- The frontend does not call OpenAI directly.
- The frontend does not call `/verify-batch`.
- The frontend does not persist uploaded files or results to a database.
- The frontend does not use `dangerouslySetInnerHTML` for extracted or provider-produced text.

## Related Reference

- [Frontend architecture](../architecture/frontend-architecture.md)
- [Frontend file reference](../reference/frontend-file-reference.md)
- [API endpoints](../api/endpoints.md)
