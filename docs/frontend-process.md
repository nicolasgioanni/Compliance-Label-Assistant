# Frontend Process

The frontend is a React/Vite prototype that keeps label review state in browser memory for the current page session. It calls the backend through one API client, stores backend verification responses as queue-item evidence, and derives badges, summaries, selected-label details, and exports from current queue state.

## Source Layout

- `frontend/src/api` contains endpoint-aware calls. Components and hooks call the backend only through `verificationApi.js`.
- `frontend/src/components/queue` contains the queue list, queue item cards, queue filters, queue actions, and queue summary.
- `frontend/src/components/verification` contains the selected-label workspace, expected-field form, result detail, field result cards, extracted text, and workflow shell.
- `frontend/src/components/dialogs` contains modal dialogs for export, copy claim data, and label preview.
- `frontend/src/components/shared` contains app-level and reusable UI pieces such as the header, footer, banner, tooltip, and loading state.
- `frontend/src/components/upload` contains upload controls.
- `frontend/src/hooks` contains queue orchestration, verification locking, removal animation state, preview selection, object URL lifecycle, and dialog dismissal behavior.
- `frontend/src/utils` contains pure helpers for expected fields, queue-item transitions, status selectors, file validation, queue file planning, browser support, and result export.
- `frontend/src/constants` contains shared copy and default expected-field text.
- `frontend/src/styles/components.css` imports ordered CSS partials from `frontend/src/styles/components` to preserve cascade order.

## Data Flow

1. `App.jsx` checks backend health and owns the active banner message.
2. `VerificationForm.jsx` wires queue state from `useQueueItems` into render-focused queue, verification, dialog, and action components.
3. Queue state lives in memory only. Uploaded files, expected fields, result evidence, stale flags, selected item, filters, and modal state are not persisted.
4. Backend responses are stored unchanged on queue items. UI status, summary, filters, and exports read selectors such as `hasCurrentResult` and `getAutomatedStatus`.
5. Export helpers build CSV and Excel files at download time and skip labels without current, non-stale results.

## Upload Flow

1. The reviewer adds files through Add Files or Add Folder.
2. `ImageUploadDropzone` passes browser `File` objects to queue state without reading bytes.
3. `planQueueFileAddition` validates extension/MIME/size, rejects duplicate basenames case-insensitively, enforces the 10-label queue limit, and returns add/skip counts.
4. Valid files become queue items through `createQueueItem`; folder paths are retained as internal context but queue rows show only basenames.
5. Preview uses the in-memory `File` and a temporary object URL that is revoked when the preview closes or changes.

## Verification Flow

- Selected-label verification validates expected fields, marks the item verifying, calls `verifySingleLabel(file, expectedFields)`, stores success evidence, or records a request error without overwriting old evidence.
- Verify Ready Labels finds ready queue items, marks them verifying, and calls `/verify` once per ready item with frontend concurrency capped at 2.
- Existing evidence is marked stale when verification starts or expected fields change so old results do not drive the UI or exports.
- Verification errors without current evidence are request-level frontend errors; stale previous evidence stays available internally but is not treated as current.

## API Client Responsibilities

- `verificationApi.js` owns `VITE_API_BASE_URL`, `/health`, `/verify`, multipart form payload construction, default government-warning fallback, and response error parsing.
- Do not put endpoint paths, `fetch`, or backend response parsing in components or hooks.
- Frontend-safe environment variable: `VITE_API_BASE_URL`, defaulting to `http://localhost:8000`.
- The OpenAI API key is backend-only and must not appear in frontend code or frontend environment files.

## Backend Response Assumptions

- `/health` returns a JSON object with `status: "ok"` when available.
- `/verify` returns `overall_status`, `field_results`, `extracted_fields`, `processing_time_ms`, and related timing/metadata fields documented in `api-contract.md`.
- Field and overall status strings are passed through for display/export; unknown field statuses fall back to "Needs Review" styling.
- Optional UI fields `bottlerProducer` and `countryOfOrigin` are currently frontend state only. They are not sent in the `/verify` payload unless the backend API contract is intentionally expanded later.

## Component Organization Rules

- Keep components focused on rendering, event wiring, and accessible UI states.
- Keep backend calls in `frontend/src/api/verificationApi.js`.
- Keep reusable stateful behavior in hooks and reusable pure behavior in utils.
- Place shared UI in `components/shared`; place feature-specific UI beside its feature group.
- Avoid new architecture patterns, context providers, routing, or state libraries unless the feature cannot stay clear with the current structure.

## Adding A Frontend Feature

1. Identify whether the feature is queue, verification, dialog, upload, shared UI, API, hook, or utility work.
2. Put endpoint-aware code in `verificationApi.js`; put pure transforms/selectors in `utils`.
3. Keep request payload and response parsing compatible with `docs/api-contract.md`.
4. Add focused tests for new utility behavior or user-visible workflows.
5. Update this document or adjacent docs when a new flow, environment variable, or backend response assumption is introduced.

## Testing And Build

Run the available frontend regression commands after frontend changes:

```powershell
cd frontend
npm run lint
npm run typecheck
npm test
npm run build
```

`npm run typecheck` is intentionally non-invasive for the current JavaScript codebase; use JSDoc `// @ts-check` or TypeScript files when adding code that should receive stricter type checking.
