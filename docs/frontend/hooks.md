# Frontend Hooks

## Purpose

Hooks coordinate stateful user interface behavior and keep components focused on rendering.

## Hook Reference

| Hook | Path | Responsibilities | Used by |
| --- | --- | --- | --- |
| `useQueueItems` | `frontend/src/hooks/useQueueItems.js` | Owns queue items, selected item, filters, copy modal state, preview state, upload planning, warmup trigger, expected field changes, removal, and action handlers. | `VerificationForm` |
| `useQueueVerification` | `frontend/src/hooks/useQueueVerification.js` | Verifies selected label or ready labels, locks verification while requests are in flight, applies success and error transitions. | `useQueueItems` |
| `useQueueRemovalAnimation` | `frontend/src/hooks/useQueueRemovalAnimation.js` | Tracks queue item ids during delayed removal and cleans timers. | `useQueueItems` |
| `useQueueItemPreview` | `frontend/src/hooks/useQueueItemPreview.js` | Tracks the active preview queue item and closes preview when the item leaves the active queue. | `useQueueItems` |
| `useObjectUrl` | `frontend/src/hooks/useObjectUrl.js` | Creates and revokes object URLs for file previews. | `LabelPreviewDialog` |
| `useDismissibleDialog` | `frontend/src/hooks/useDismissibleDialog.js` | Closes dialogs on Escape and outside pointer events. | dialog components |

## Verification Locking

`useQueueVerification` uses:

- `isVerifyingAll` state for ready-label verification.
- `verificationInFlightRef` to prevent overlapping verification runs.
- queue item status checks for item-level verification state.

Ready-label verification uses the `VERIFY_ALL_CONCURRENCY` setting. The current value is `2`.

## Warmup Behavior

`useQueueItems` calls `warmVerificationBackend()` once after the first successful file addition. Warmup failure is ignored in the frontend because the actual verification call still reports its own result.

## Removal Behavior

`useQueueRemovalAnimation` delays actual removal by adding `QUEUE_REMOVAL_ANIMATION_MS` and `QUEUE_REMOVAL_SNAP_PAUSE_MS`. If the selected item is removed, selection moves to the next active item, then previous active item, then `null`.
