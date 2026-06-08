# Frontend Testing

## Test Framework

- Vitest
- jsdom environment
- Testing Library React
- Testing Library user-event
- jest-dom matchers through `frontend/src/setupTests.js`

## Commands

```powershell
cd frontend
npm run lint
npm run typecheck
npm test
npm run test:watch
npm run build
```

## Test Files

Unit utility tests:

- `frontend/src/utils/browserSupport.test.js`
- `frontend/src/utils/expectedFields.test.js`
- `frontend/src/utils/fileValidation.test.js`
- `frontend/src/utils/queueFileValidation.test.js`
- `frontend/src/utils/queueItemState.test.js`
- `frontend/src/utils/queueStatusFilters.test.js`
- `frontend/src/utils/resultExport.test.js`
- `frontend/src/utils/statusResolution.test.js`

Component and workflow tests:

- `frontend/src/App.test.jsx`
- `frontend/src/components/shared/ErrorBanner.test.jsx`
- `frontend/src/components/upload/ImageUploadDropzone.test.jsx`
- `frontend/src/components/queue/QueueSummaryBar.test.jsx`
- `frontend/src/components/verification/VerificationForm.queue.test.jsx`
- `frontend/src/components/verification/VerificationForm.resultNavigation.test.jsx`
- `frontend/src/components/verification/VerificationForm.copyData.test.jsx`
- `frontend/src/components/verification/VerificationForm.export.test.jsx`

Constants:

- `frontend/src/constants/defaultWarningText.test.js`

Test helpers:

- `frontend/src/components/verification/VerificationForm.testUtils.jsx`

## Coverage Areas

Existing tests cover:

- Health/error banner behavior.
- Upload accept filters, folder upload support, queue duplicate handling, invalid files, and queue limits.
- Queue item state transitions.
- Queue status filtering and summaries.
- Selected-label verification and ready-label verification.
- Stale result behavior.
- Copy claim data behavior.
- CSV and Excel export behavior.
- Status display logic.

## Missing

No explicit coverage script is defined in `frontend/package.json`.
