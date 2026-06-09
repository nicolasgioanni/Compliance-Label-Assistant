# State And Queue Flow

## Queue Item Shape

Queue items are created by `createQueueItem` in `frontend/src/utils/queueItemState.js`.

Important fields:

- `id`
- `file`
- `filename`
- `relativePath`
- `expectedFields`
- `result`
- `isResultStale`
- `status`
- `errorMessage`
- `workspaceView`

## Queue Statuses

Frontend workflow statuses include:

- `needs_expected_data`
- `ready`
- `verifying`
- `error`

Backend result statuses may also appear on queue items after success:

- `pass`
- `fail`
- `error`

`frontend/src/utils/statusResolution.js` decides when to use a current backend result versus a frontend workflow status. Legacy `needs_review` result statuses are treated as `fail`.

## Queue Addition

`planQueueFileAddition` returns:

- `filesToAdd`
- `duplicateCount`
- `excludedForLimitCount`
- `invalidCount`

Invalid, duplicate, and over-limit files are skipped before queue items are created.

## Expected Field State

`frontend/src/utils/expectedFields.js` defines:

- expected field definitions
- visible field definitions
- required field definitions
- empty expected field shape
- example expected fields
- validation helpers

Only brand name is required by frontend validation before verification. Other visible expected fields are optional and are checked by the backend only when non-blank.

## Result Freshness

When expected fields change after a result exists:

- The result remains stored.
- `isResultStale` becomes `true`.
- The workspace returns to form view.
- Result summaries and exports ignore stale result evidence.

## Copy Claim Data Flow

`CopyClaimDataModal` lets the reviewer copy expected fields from the selected source label to target labels.

Utilities:

- `copyExpectedFields`
- `clearCopiedExpectedFields`
- `hasBlankCopyExpectedField`
- `hasDifferentCopyExpectedFields`

Copying clears stale verification evidence from changed target labels.

## Verification Flow

Selected label:

1. Validate selected item exists.
2. Validate expected fields.
3. Mark item verifying.
4. Call `verifySingleLabel`.
5. Apply success or error transition.

Ready labels:

1. Collect active queue items with `status === 'ready'`.
2. Mark them verifying.
3. Process with concurrency `2`.
4. Apply each item result independently.

## Export Flow

`buildQueueExportRows` exports only queue items with current result evidence. It excludes unverified, stale, and failed-request items without current backend result data.
