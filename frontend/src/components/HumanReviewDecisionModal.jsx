import { useMemo, useState } from 'react';
import { useDismissibleDialog } from '../hooks/useDismissibleDialog';
import { getStatusLabel } from '../utils/statusStyles';
import {
  getAllowedManualDecisionStatuses,
  getEffectiveStatus,
  getManualDecision,
} from '../utils/statusResolution';

export default function HumanReviewDecisionModal({ item, onApply, onClear, onClose }) {
  const manualDecision = getManualDecision(item);
  const allowedStatuses = useMemo(() => getAllowedManualDecisionStatuses(item), [item]);
  const [selectedStatus, setSelectedStatus] = useState(() =>
    getInitialStatus({ allowedStatuses, item, manualDecision }),
  );
  const [note, setNote] = useState(() => manualDecision?.note || '');
  const { handleOverlayMouseDown } = useDismissibleDialog(onClose);

  function handleApply() {
    if (!allowedStatuses.includes(selectedStatus)) {
      return;
    }

    onApply({
      status: selectedStatus,
      note: note.trim(),
      updatedAt: new Date().toISOString(),
    });
  }

  function handleClear() {
    onClear();
  }

  return (
    <div className="human-review-dialog-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        aria-labelledby="human-review-dialog-title"
        aria-modal="true"
        className="human-review-dialog"
        role="dialog"
      >
        <div className="human-review-dialog-header">
          <h2 id="human-review-dialog-title">Set Human Review Decision</h2>
          <p title={item.relativePath || item.filename}>{item.filename}</p>
        </div>

        <fieldset className="human-review-status-list">
          <legend>Status choice</legend>
          {allowedStatuses.map((status) => (
            <label
              className={
                selectedStatus === status
                  ? 'human-review-status-option human-review-status-option-selected'
                  : 'human-review-status-option'
              }
              key={status}
            >
              <input
                checked={selectedStatus === status}
                name="human-review-status"
                type="radio"
                value={status}
                onChange={() => setSelectedStatus(status)}
              />
              <span>{getStatusLabel(status)}</span>
            </label>
          ))}
        </fieldset>

        <label className="human-review-note-field">
          <span>Optional reviewer note</span>
          <textarea
            placeholder="Optional note for the manual decision"
            rows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>

        <div className="human-review-dialog-footer">
          <button className="secondary-button export-dialog-back-button" type="button" onClick={onClose}>
            Back
          </button>
          <div className="human-review-dialog-actions">
            {manualDecision ? (
              <button className="secondary-button human-review-clear-button" type="button" onClick={handleClear}>
                Clear Manual Decision
              </button>
            ) : null}
            <button className="primary-button" type="button" onClick={handleApply}>
              Apply Decision
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getInitialStatus({ allowedStatuses, item, manualDecision }) {
  const preferredStatus = manualDecision?.status || getEffectiveStatus(item);

  if (allowedStatuses.includes(preferredStatus)) {
    return preferredStatus;
  }

  return allowedStatuses[0] || 'needs_review';
}
