# Frontend Components

## Purpose

Components focus on rendering and user interaction. API calls and reusable state transitions live outside components.

## Shared Components

| Component | Path | Purpose |
| --- | --- | --- |
| `Header` | `frontend/src/components/shared/Header.jsx` | Displays application header and backend online status. |
| `ErrorBanner` | `frontend/src/components/shared/ErrorBanner.jsx` | Shows dismissible error, info, or warning banners with optional auto-dismiss. |
| `InfoTooltip` | `frontend/src/components/shared/InfoTooltip.jsx` | Renders viewport-positioned tooltip content through a portal. |
| `LoadingState` | `frontend/src/components/shared/LoadingState.jsx` | Shows the verifying loading state. |
| `AppFooter` | `frontend/src/components/shared/AppFooter.jsx` | Displays shared footer identity, prototype disclaimer, copyright/license text, and resource links. |

## Upload Components

| Component | Path | Purpose |
| --- | --- | --- |
| `ImageUploadDropzone` | `frontend/src/components/upload/ImageUploadDropzone.jsx` | Renders Add Files and Add Folder controls using the shared accept list. |

`ImageUploadDropzone` depends on `supportsDirectoryUpload`, `FILE_INPUT_ACCEPT`, and `SUPPORTED_IMAGE_DESCRIPTION`.

## Queue Components

| Component | Path | Purpose |
| --- | --- | --- |
| `LabelQueue` | `frontend/src/components/queue/LabelQueue.jsx` | Composes upload controls, filters, queue list, empty states, and clear action. |
| `QueueItemCard` | `frontend/src/components/queue/QueueItemCard.jsx` | Renders one selectable queue item with preview and remove controls. |
| `QueueStatusFilters` | `frontend/src/components/queue/QueueStatusFilters.jsx` | Renders filter buttons for needs review, pass, and fail groups. |
| `QueueSummaryBar` | `frontend/src/components/queue/QueueSummaryBar.jsx` | Shows summary counts and export entrypoint. |
| `QueueActions` | `frontend/src/components/queue/QueueActions.jsx` | Shows verify selected and verify ready-label actions. |

## Verification Components

| Component | Path | Purpose |
| --- | --- | --- |
| `VerificationForm` | `frontend/src/components/verification/VerificationForm.jsx` | Top-level workflow composition. |
| `SelectedLabelWorkspace` | `frontend/src/components/verification/SelectedLabelWorkspace.jsx` | Switches selected-label area between empty, form, loading, error, and result states. |
| `ExpectedFieldsForm` | `frontend/src/components/verification/ExpectedFieldsForm.jsx` | Renders expected field inputs, example loading, clearing, and copy-data action. |
| `SelectedResultDetail` | `frontend/src/components/verification/SelectedResultDetail.jsx` | Renders selected result metadata, field results, government warning comparison, and extracted fields. |
| `FieldResultCard` | `frontend/src/components/verification/FieldResultCard.jsx` | Renders one backend `FieldResult`. |
| `ExtractedTextPanel` | `frontend/src/components/verification/ExtractedTextPanel.jsx` | Renders extracted structured fields and raw text when present. |

## Dialog Components

| Component | Path | Purpose |
| --- | --- | --- |
| `CopyClaimDataModal` | `frontend/src/components/dialogs/CopyClaimDataModal.jsx` | Copies selected label expected fields to chosen target labels, optionally clearing the source. |
| `LabelPreviewDialog` | `frontend/src/components/dialogs/LabelPreviewDialog.jsx` | Shows a client-side preview of a queued file. |
| `ExportResultsDialog` | `frontend/src/components/dialogs/ExportResultsDialog.jsx` | Lets the reviewer choose CSV or Excel export. |

## Adding A Component

1. Put rendering-only components in the closest existing component folder.
2. Put reusable logic in `frontend/src/utils` or `frontend/src/hooks`.
3. Keep backend calls in `frontend/src/api/verificationApi.js`.
4. Add focused tests when behavior affects queue state, uploads, export, result rendering, or error display.
5. Add or update styling in the relevant CSS partial under `frontend/src/styles/components/`.
