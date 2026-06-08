# Frontend Process

The frontend is a React/Vite prototype that keeps label review state in browser memory for the current page session. Backend verification responses are stored as evidence on queue items and drive queue badges, summary counts, selected-label status, and exports.

## Source Layout

- `frontend/src/api` contains endpoint-aware calls. Components and hooks should call the backend through this layer.
- `frontend/src/components` contains render-focused UI for the queue, selected-label workspace, dialogs, banners, and result cards.
- `frontend/src/hooks` contains queue orchestration, verification locking, removal animation state, and shared dialog dismissal behavior.
- `frontend/src/utils` contains pure helpers for expected fields, queue item transitions, status selectors, file validation, and result export.
- `frontend/src/constants` contains shared frontend copy and default expected-field text.
- `frontend/src/styles/components.css` is an ordered CSS aggregator for component CSS partials in `frontend/src/styles/components`.

## Queue And Verification Flow

1. The reviewer adds files through the queue upload controls.
2. Client-side validation filters unsupported, duplicate, oversized, or over-limit files before any backend request.
3. Each queued label stores its uploaded `file`, optional folder `relativePath`, expected fields, workflow status, selected workspace view, stale flag, backend `result`, and request error message.
4. `useQueueItems` coordinates user events and delegates verification work to `useQueueVerification`.
5. Verification calls the backend through `verificationApi.js` for the selected ready label or ready labels in the queue.
6. Verification start marks existing evidence stale so old results do not drive the UI while a new request is running.
7. Verification success stores the backend response as `queueItem.result` and moves the selected item to the result view.
8. Verification errors without result evidence stay request-level frontend errors and do not overwrite automated evidence.

## File Preview Flow

The label queue shows only each file's basename. Folder paths from folder uploads are kept as internal context when useful, but they are not shown in queue rows.

The queue Preview action opens an in-app modal for the selected file. Preview uses the current in-memory `File` object and a temporary browser object URL created with `URL.createObjectURL`. The object URL is revoked when the preview closes or changes files, and the preview closes safely if its queue item is removed.

Preview does not upload, route, persist, or mutate queue data. Uploaded files and expected fields remain React-memory-only for the current page session and are not stored in localStorage, sessionStorage, IndexedDB, or backend storage.

## Stale Results And Expected Fields

Expected-field edits and copied expected-field changes use pure queue item transitions in `queueItemState.js`. When expected fields change after a current result exists, the previous result is marked stale or cleared according to the existing transition so queue badges, selected result details, and exports stop treating old evidence as current.

The `Back to Results` action appears only when a selected label still has a current, non-stale result. It switches the workspace view back to the existing result without changing expected fields, backend evidence, or export data.

## Export Flow

CSV and Excel exports are client-side only. `resultExport.js` receives queue items at download time, skips labels without a current result, and builds rows from selectors rather than mutating queue state.

Exports include the backend `overall_status`, field-level statuses, and processing time. Raw extracted text is not exported.

## Styling

Component CSS is split into focused partials and imported through `frontend/src/styles/components.css` to preserve cascade order. Status and filter classes are partly generated from selectors and should be checked before removing styles that look unused by direct text search.

## Testing

Frontend tests cover pure utility behavior and user-visible workflows:

- queue validation, add/remove/select/filter behavior
- queue file preview behavior and object URL cleanup
- selected and ready-label verification flows
- stale result handling and result navigation
- expected-field copy behavior
- CSV and Excel export behavior
- banner and dialog dismissal behavior

Run the frontend regression suite after frontend changes:

```powershell
cd frontend
npm run test
npm run build
```
