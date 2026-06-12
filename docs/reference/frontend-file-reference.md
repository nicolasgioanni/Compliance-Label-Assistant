# Frontend File Reference

## Entrypoints And App Shell

| Path | Purpose | Main exports | Main dependencies | Used by | Notes |
| --- | --- | --- | --- | --- | --- |
| `frontend/src/main.jsx` | Creates the React root and imports global styles. | none | `react`, `react-dom/client`, `App`, CSS files | Vite HTML entry | Mounts into `#root`. |
| `frontend/src/App.jsx` | App shell with backend health check, active error banner, header, verification workflow, and footer. | `App` default | `checkHealth`, shared components, `VerificationForm`, notification constants | `frontend/src/main.jsx` | Converts fetch failure into service unavailable copy. |
| `frontend/src/setupTests.js` | Test setup for jest-dom matchers. | none | `@testing-library/jest-dom/vitest` | Vitest config | Loaded by `vite.config.js`. |
| `frontend/src/App.test.jsx` | Tests app-level notification behavior. | none | Testing Library, Vitest, mocked API, `App` | Test runner | Covers banner replacement and tone behavior. |

## API And Constants

| Path | Purpose | Main exports | Main dependencies | Used by | Notes |
| --- | --- | --- | --- | --- | --- |
| `frontend/src/api/verificationApi.js` | Centralized backend API client. | `checkHealth`, `warmVerificationBackend`, `verifySingleLabel` | `DEFAULT_GOVERNMENT_WARNING`, `fetch`, `FormData`, `VITE_API_BASE_URL` | `App`, `useQueueItems`, `useQueueVerification` | Calls `/health`, `/warmup`, `/verify`; does not call `/verify-batch`. |
| `frontend/src/constants/defaultWarningText.js` | Frontend default standard warning text. | `DEFAULT_GOVERNMENT_WARNING` | none | expected-field utilities and API client | Backend still verifies against its own standard constant. |
| `frontend/src/constants/defaultWarningText.test.js` | Tests default warning text. | none | Vitest, constant | Test runner | Verifies numbered standard warning text. |
| `frontend/src/constants/notificationMessages.js` | Shared user-facing notification strings. | `SERVICE_UNAVAILABLE_MESSAGE`, `STALE_RESULT_EDIT_MESSAGE`, `STALE_RESULT_CHANGED_MESSAGE` | none | `App`, queue hooks | Keeps repeated messages centralized. |

## Hooks

| Path | Purpose | Main exports | Main dependencies | Used by | Notes |
| --- | --- | --- | --- | --- | --- |
| `frontend/src/hooks/useQueueItems.js` | Top-level queue orchestration hook. | `useQueueItems` | React hooks, warmup API, queue utilities, status utilities, child hooks | `VerificationForm` | Owns queue state, selected item, filters, copy modal, preview, and public handlers. |
| `frontend/src/hooks/useQueueVerification.js` | Verification request orchestration and locking. | `useQueueVerification` | `verifySingleLabel`, expected-field validation, queue item transitions | `useQueueItems` | Ready-label verification concurrency is `2`. |
| `frontend/src/hooks/useQueueRemovalAnimation.js` | Queue item removal delay and cleanup. | `useQueueRemovalAnimation` | React hooks, timers | `useQueueItems` | Keeps selection valid when removing selected item. |
| `frontend/src/hooks/useQueueItemPreview.js` | Preview item selection state. | `useQueueItemPreview` | React hooks | `useQueueItems` | Closes preview if the item leaves the active queue. |
| `frontend/src/hooks/useObjectUrl.js` | Creates and revokes browser object URLs. | `useObjectUrl` | React hooks, `URL` | `LabelPreviewDialog` | Used for local file preview only. |
| `frontend/src/hooks/useDismissibleDialog.js` | Dialog dismissal on Escape and outside pointer events. | `useDismissibleDialog` | React `useEffect`, document events | dialog components | Adds and removes document listeners. |

## Dialog Components

| Path | Purpose | Main exports | Main dependencies | Used by | Notes |
| --- | --- | --- | --- | --- | --- |
| `frontend/src/components/dialogs/CopyClaimDataModal.jsx` | Modal for copying expected fields from selected source label to target labels. | `CopyClaimDataModal` default | React hooks, dialog hook, expected-field copy utilities, status utilities, `InfoTooltip` | `VerificationForm` | Supports target selection, all/clear selection, blank/overwrite warnings, and optional source clear. |
| `frontend/src/components/dialogs/ExportResultsDialog.jsx` | Modal for choosing CSV or Excel export. | `ExportResultsDialog` default | React `useState`, dialog hook, `InfoTooltip` | `QueueSummaryBar` | Handles Excel download errors through callback. |
| `frontend/src/components/dialogs/LabelPreviewDialog.jsx` | Modal preview for a queued label file. | `LabelPreviewDialog` default | dialog hook, `useObjectUrl` | `VerificationForm` | Uses a temporary object URL and revokes it through the hook. |

## Queue Components

| Path | Purpose | Main exports | Main dependencies | Used by | Notes |
| --- | --- | --- | --- | --- | --- |
| `frontend/src/components/queue/LabelQueue.jsx` | Composes upload controls, filters, queue item list, empty states, and clear action. | `LabelQueue` default | `ImageUploadDropzone`, `InfoTooltip`, `QueueItemCard`, `QueueStatusFilters` | `VerificationForm` | Receives queue data and callbacks from `useQueueItems`. |
| `frontend/src/components/queue/QueueActions.jsx` | Renders verify selected and verify ready-label buttons. | `QueueActions` default | none | `VerificationForm` | Button disabled state is controlled by parent hook state. |
| `frontend/src/components/queue/QueueItemCard.jsx` | Renders one queue item, status label, preview button, and remove button. | `QueueItemCard` default | queue status utilities | `LabelQueue` | Keeps select, preview, and remove click targets separate. |
| `frontend/src/components/queue/QueueStatusFilters.jsx` | Renders queue filter toggle buttons. | `QueueStatusFilters` default | `QUEUE_FILTERS`, `InfoTooltip` | `LabelQueue` | Disabled while queue is locked. |
| `frontend/src/components/queue/QueueSummaryBar.jsx` | Renders result summary counts and export entrypoint. | `QueueSummaryBar` default | React `useState`, `ExportResultsDialog`, `InfoTooltip` | `VerificationForm` | Opens export dialog only when export is enabled. |
| `frontend/src/components/queue/QueueSummaryBar.test.jsx` | Tests summary copy and tooltip behavior. | none | Testing Library, `QueueSummaryBar` | Test runner | Covers need-attention summary behavior. |

## Shared Components

| Path | Purpose | Main exports | Main dependencies | Used by | Notes |
| --- | --- | --- | --- | --- | --- |
| `frontend/src/components/shared/AppFooter.jsx` | Footer component. | `AppFooter` default | none | `App` | Shared identity, prototype disclaimer, copyright/license text, and resource links. |
| `frontend/src/components/shared/ErrorBanner.jsx` | Dismissible alert banner. | `ErrorBanner` default | React hooks | `App` | Supports error, info, and warning tone classes. |
| `frontend/src/components/shared/ErrorBanner.test.jsx` | Tests banner tones and dismissal. | none | Testing Library, `ErrorBanner` | Test runner | Covers default, info, warning, and auto-dismiss behavior. |
| `frontend/src/components/shared/Header.jsx` | Header with service status indicator. | `Header` default | none | `App` | `isOnline` controls status display. |
| `frontend/src/components/shared/InfoTooltip.jsx` | Portal-based tooltip. | `InfoTooltip` default | React hooks, `createPortal` | many components | Measures trigger and tooltip position with viewport padding. |
| `frontend/src/components/shared/LoadingState.jsx` | Verifying loading state. | `LoadingState` default | none | `SelectedLabelWorkspace` | Static loading user interface content. |

## Upload Components

| Path | Purpose | Main exports | Main dependencies | Used by | Notes |
| --- | --- | --- | --- | --- | --- |
| `frontend/src/components/upload/ImageUploadDropzone.jsx` | File and folder upload controls. | `ImageUploadDropzone` default | React `useRef`, browser support utility, file validation constants | `LabelQueue` | Sends selected files to caller; disables folder button when unsupported. |
| `frontend/src/components/upload/ImageUploadDropzone.test.jsx` | Tests upload controls. | none | Testing Library, file validation constants, component | Test runner | Covers accept filters, folder support, and callback behavior. |

## Verification Components

| Path | Purpose | Main exports | Main dependencies | Used by | Notes |
| --- | --- | --- | --- | --- | --- |
| `frontend/src/components/verification/VerificationForm.jsx` | Main verification workflow composition. | `VerificationForm` default | queue, dialog, workspace components, `useQueueItems`, export utilities | `App` | Connects hook state to user interface components. |
| `frontend/src/components/verification/ExpectedFieldsForm.jsx` | Expected field input form. | `ExpectedFieldsForm` default | default warning, expected-field definitions, `InfoTooltip` | `SelectedLabelWorkspace` | Includes load example, clear fields, back-to-results, and copy-data controls. |
| `frontend/src/components/verification/ExtractedTextPanel.jsx` | Displays extracted structured fields and raw text when present. | `ExtractedTextPanel` default | none | `SelectedResultDetail` | Current backend provider returns `raw_text: null`. |
| `frontend/src/components/verification/FieldResultCard.jsx` | Displays one `FieldResult`. | `FieldResultCard` default | status style utilities | `SelectedResultDetail` | Shows expected, observed, reason, and confidence. |
| `frontend/src/components/verification/SelectedLabelWorkspace.jsx` | Switches selected workspace state. | `SelectedLabelWorkspace` default | status utilities, expected form, tooltip, loading, result detail | `VerificationForm` | Handles empty, form, loading, error, and result views. |
| `frontend/src/components/verification/SelectedResultDetail.jsx` | Selected result detail view. | `SelectedResultDetail` default | status utilities, `InfoTooltip`, extracted panel, field card | `SelectedLabelWorkspace` | Separates government warning comparison from other field results. |
| `frontend/src/components/verification/VerificationForm.testUtils.jsx` | Shared test helpers for verification workflow tests. | test helpers | Testing Library, Vitest, mocked API/export modules, `VerificationForm` | verification tests | Provides file factories, render helpers, result fixtures, and object URL mocks. |
| `frontend/src/components/verification/VerificationForm.queue.test.jsx` | Tests queue behavior. | none | test utilities, mocked API | Test runner | Covers upload warnings, warmup, duplicate handling, preview, filters, copy button enablement, and export enablement. |
| `frontend/src/components/verification/VerificationForm.resultNavigation.test.jsx` | Tests result navigation and concurrent ready-label behavior. | none | test utilities, mocked API | Test runner | Covers in-progress action locking, partial failures, selected-only verification, and stale editing. |
| `frontend/src/components/verification/VerificationForm.copyData.test.jsx` | Tests copy claim data modal behavior. | none | test utilities, mocked API | Test runner | Covers target selection, overwrites, blank values, and clearing source. |
| `frontend/src/components/verification/VerificationForm.export.test.jsx` | Tests CSV and Excel export workflow. | none | test utilities, mocked export utilities | Test runner | Covers export dialog and error handling. |

## Utilities

| Path | Purpose | Main exports | Main dependencies | Used by | Notes |
| --- | --- | --- | --- | --- | --- |
| `frontend/src/utils/browserSupport.js` | Detects folder upload support. | `supportsDirectoryUpload` | DOM file input creation | `ImageUploadDropzone` | Checks `webkitdirectory` or `directory` support. |
| `frontend/src/utils/browserSupport.test.js` | Tests browser support detection. | none | Vitest, utility | Test runner | Covers supported and unsupported inputs. |
| `frontend/src/utils/expectedFieldCopy.js` | Copy/clear helpers for expected fields. | `COPY_EXPECTED_FIELD_NAMES`, copy helpers | `createEmptyExpectedFields` | `CopyClaimDataModal`, `queueItemState` | Excludes brand name when checking blank copy warnings. |
| `frontend/src/utils/expectedFields.js` | Expected field definitions and validation. | definitions, empty/example creators, validators | `DEFAULT_GOVERNMENT_WARNING` | forms, queue hooks, queue state | Brand name is the required visible field. |
| `frontend/src/utils/expectedFields.test.js` | Tests expected field utilities. | none | Vitest, utilities | Test runner | Covers visible field detection and required brand validation. |
| `frontend/src/utils/fileValidation.js` | Client-side single-file validation and filename normalization. | `validateSingleFile`, `normalizeFilename`, `getCanonicalUploadFilename`, constants | none | upload and queue utilities | Supported types and limits are duplicated client-side for early feedback. |
| `frontend/src/utils/fileValidation.test.js` | Tests file validation. | none | Vitest, file utility | Test runner | Covers extension/MIME matching and size limit. |
| `frontend/src/utils/queueFileValidation.js` | Plans queue additions and upload warning messages. | `planQueueFileAddition`, `buildUploadWarningMessage` | file validation utilities | `useQueueItems` | Separates invalid, duplicate, and over-limit counts. |
| `frontend/src/utils/queueFileValidation.test.js` | Tests queue addition planning. | none | Vitest, utility | Test runner | Covers duplicate basenames, folder paths, invalid files, and queue limit. |
| `frontend/src/utils/queueItemState.js` | Queue item factory and immutable state transitions. | queue item transition functions | expected field utilities, copy helpers, status resolution | `useQueueItems`, `useQueueVerification` | Generates ids with `crypto.randomUUID` when available. |
| `frontend/src/utils/queueItemState.test.js` | Tests queue item transitions. | none | Vitest, utility | Test runner | Covers stale result handling, success/error transitions, copy, clear, and generated ids. |
| `frontend/src/utils/queueStatusFilters.js` | Queue filter definitions and filtering. | `QUEUE_FILTERS`, filter helpers | `getAutomatedStatus` | `useQueueItems`, `QueueStatusFilters` | Unknown statuses map to needs-work filter. |
| `frontend/src/utils/queueStatusFilters.test.js` | Tests queue filters. | none | Vitest, utility | Test runner | Covers defaults, filtering, backend status mapping, and all-off state. |
| `frontend/src/utils/resultExport.js` | CSV and Excel export utilities. | filename, row, CSV, XLSX, download helpers | `write-excel-file`, status resolution | `VerificationForm`, tests | Exports current results only, skips raw extracted text, and neutralizes CSV formula prefixes. |
| `frontend/src/utils/resultExport.test.js` | Tests export utilities. | none | Vitest, export utilities, mocked Excel writer | Test runner | Covers rows, filenames, CSV escaping and formula-prefix handling, downloads, and XLSX rows. |
| `frontend/src/utils/statusResolution.js` | Resolves displayed queue statuses and summary counts. | status helpers | `getStatusLabel` | queue components, hooks, export | Uses current backend result unless stale or missing. |
| `frontend/src/utils/statusResolution.test.js` | Tests status resolution. | none | Vitest, utility | Test runner | Covers current result, stale fallback, labels, classes, and counts. |
| `frontend/src/utils/statusStyles.js` | Status labels and CSS class helpers. | `getStatusLabel`, `getStatusClassName`, `getStatusTextClassName` | none | result and queue components | Maps unknown statuses to readable fallback. |

## Styles

| Path | Purpose | Main exports | Main dependencies | Used by | Notes |
| --- | --- | --- | --- | --- | --- |
| `frontend/src/styles/index.css` | Global base styles and variables. | CSS | none | `frontend/src/main.jsx` | Sets page-level appearance. |
| `frontend/src/styles/components.css` | Imports component CSS partials. | CSS | component partials | `frontend/src/main.jsx` | Central style bundle. |
| `frontend/src/styles/components/layout.css` | Layout styles. | CSS | none | `components.css` | App shell and workflow layout. |
| `frontend/src/styles/components/forms-controls.css` | Form and button styles. | CSS | none | `components.css` | Inputs, controls, and shared buttons. |
| `frontend/src/styles/components/queue.css` | Queue user interface styles. | CSS | none | `components.css` | Queue list, cards, filters, and actions. |
| `frontend/src/styles/components/selected-workspace.css` | Selected label workspace styles. | CSS | none | `components.css` | Workspace panel, states, and expected data area. |
| `frontend/src/styles/components/status-results.css` | Status and result styles. | CSS | none | `components.css` | Status labels, field cards, summaries, extracted text. |
| `frontend/src/styles/components/dialogs-feedback.css` | Dialog and feedback styles. | CSS | none | `components.css` | Modals, banners, tooltips, feedback states. |
| `frontend/src/styles/components/responsive.css` | Responsive adjustments. | CSS | none | `components.css` | Mobile and viewport-specific layout changes. |

## Public Assets

| Path | Purpose | Notes |
| --- | --- | --- |
| `frontend/public/cla-logo.png` | Static logo asset served by Vite. | Binary asset internals are not documented. |
