import { useEffect, useMemo, useState } from 'react';
import { hasAnyVisibleExpectedFieldValue } from '../utils/expectedFields';
import {
  hasBlankCopyExpectedField,
  hasDifferentCopyExpectedFields,
} from '../utils/expectedFieldCopy';
import InfoTooltip from './InfoTooltip';

const QUEUE_STATUS_LABELS = {
  needs_expected_data: 'Needs Expected Data',
  ready: 'Ready',
  verifying: 'Verifying',
  pass: 'Pass',
  fail: 'Fail',
  needs_review: 'Needs Review',
  error: 'Error',
};

export default function CopyClaimDataModal({ queueItems, sourceItem, onApply, onClose }) {
  const [selectedTargetIds, setSelectedTargetIds] = useState(() => new Set());
  const [shouldClearSource, setShouldClearSource] = useState(false);
  const clearSourceLabelId = 'copy-data-clear-source-label';
  const targetItems = useMemo(
    () => queueItems.filter((item) => item.id !== sourceItem.id),
    [queueItems, sourceItem.id],
  );
  const hasBlankSourceFields = hasBlankCopyExpectedField(sourceItem.expectedFields);
  const [isBlankWarningVisible, setIsBlankWarningVisible] = useState(() => hasBlankSourceFields);
  const selectedTargets = targetItems.filter((item) => selectedTargetIds.has(item.id));
  const willOverwriteExpectedData = selectedTargets.some((item) =>
    hasAnyVisibleExpectedFieldValue(item.expectedFields),
  );
  const willClearResults = selectedTargets.some(
    (item) => item.result && hasDifferentCopyExpectedFields(item.expectedFields, sourceItem.expectedFields),
  );
  const canApply = selectedTargetIds.size > 0 || shouldClearSource;
  const primaryButtonLabel =
    selectedTargetIds.size === 0 && shouldClearSource ? 'Clear Source Data' : 'Apply to Selected Labels';

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const targetItemIds = new Set(targetItems.map((item) => item.id));
    setSelectedTargetIds((currentIds) => {
      const nextIds = new Set(Array.from(currentIds).filter((itemId) => targetItemIds.has(itemId)));
      return nextIds.size === currentIds.size ? currentIds : nextIds;
    });
  }, [targetItems]);

  useEffect(() => {
    if (!isBlankWarningVisible) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setIsBlankWarningVisible(false);
    }, 10000);

    return () => window.clearTimeout(timeoutId);
  }, [isBlankWarningVisible]);

  function handleOverlayMouseDown(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleToggleTarget(itemId) {
    setSelectedTargetIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(itemId)) {
        nextIds.delete(itemId);
      } else {
        nextIds.add(itemId);
      }
      return nextIds;
    });
  }

  function handleSelectAll() {
    setSelectedTargetIds(new Set(targetItems.map((item) => item.id)));
  }

  function handleClearSelection() {
    setSelectedTargetIds(new Set());
  }

  function handleApply() {
    if (!canApply) {
      return;
    }

    onApply({
      shouldClearSource,
      targetIds: Array.from(selectedTargetIds),
    });
  }

  return (
    <div className="copy-data-dialog-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        aria-labelledby="copy-data-dialog-title"
        aria-modal="true"
        className="copy-data-dialog"
        role="dialog"
      >
        {hasBlankSourceFields && isBlankWarningVisible ? (
          <div className="copy-data-blank-warning" role="alert">
            <span>Blank fields will also be copied.</span>
            <button
              aria-label="Dismiss blank field warning"
              className="copy-data-blank-warning-close"
              type="button"
              onClick={() => setIsBlankWarningVisible(false)}
            >
              X
            </button>
          </div>
        ) : null}
        <div className="copy-data-dialog-header">
          <div className="copy-data-title-row">
            <h2 id="copy-data-dialog-title">Copy Expected Data to Labels</h2>
            <InfoTooltip label="About copying expected data">
              Copy the expected data from this label to other labels in your queue. Nothing changes until you click
              Apply.
            </InfoTooltip>
          </div>
        </div>

        <div className="copy-data-source">
          <span className="copy-data-label-row">
            <span className="copy-data-section-label">Source Label</span>
            <InfoTooltip label="About the source label">
              This is the label you are copying from. Its expected data will be used for the selected target labels.
            </InfoTooltip>
          </span>
          <div className="copy-data-source-row">
            <span className="copy-data-filename" title={sourceItem.relativePath || sourceItem.filename}>
              {sourceItem.filename}
            </span>
            <span className={getQueueStatusClassName(sourceItem.status)}>{getQueueStatusLabel(sourceItem.status)}</span>
          </div>
        </div>

        <div className="copy-data-toolbar">
          <span className="copy-data-label-row">
            <span className="copy-data-section-label">Target Labels</span>
            <InfoTooltip label="About target labels">
              Choose the labels that should receive this expected data. Labels you do not select will stay unchanged.
            </InfoTooltip>
          </span>
          <span className="copy-data-toolbar-actions">
            <button className="link-button" disabled={!targetItems.length} type="button" onClick={handleSelectAll}>
              Select All
            </button>
            <span className="claim-context-action-separator" aria-hidden="true" />
            <button
              className="link-button"
              disabled={!selectedTargetIds.size}
              type="button"
              onClick={handleClearSelection}
            >
              Clear Selection
            </button>
          </span>
        </div>

        {willOverwriteExpectedData ? (
          <p className="copy-data-message copy-data-message-warning">
            Selected labels with existing expected data will be overwritten.
          </p>
        ) : null}
        {willClearResults ? (
          <p className="copy-data-message copy-data-message-info">
            Verification results will be cleared for selected labels whose expected data changes.
          </p>
        ) : null}

        <fieldset className="copy-data-list">
          <legend className="sr-only">Target labels to receive copied claim data</legend>
          {targetItems.map((item) => {
            const isSelected = selectedTargetIds.has(item.id);
            const filePath = item.relativePath || item.filename;

            return (
              <label
                className={isSelected ? 'copy-data-row copy-data-row-selected' : 'copy-data-row'}
                key={item.id}
              >
                <input
                  checked={isSelected}
                  type="checkbox"
                  onChange={() => handleToggleTarget(item.id)}
                />
                <span className="copy-data-row-copy">
                  <span className="copy-data-filename" title={filePath}>
                    {item.filename}
                  </span>
                  <span className="copy-data-row-hint">{getTargetHint(item, sourceItem.expectedFields)}</span>
                </span>
                <span className={getQueueStatusClassName(item.status)}>{getQueueStatusLabel(item.status)}</span>
              </label>
            );
          })}
        </fieldset>

        <label className="copy-data-move-option">
          <input
            aria-labelledby={clearSourceLabelId}
            checked={shouldClearSource}
            type="checkbox"
            onChange={(event) => setShouldClearSource(event.target.checked)}
          />
          <span className="copy-data-move-label-row">
            <span id={clearSourceLabelId}>Clear data from source label after applying</span>
            <InfoTooltip label="About clearing source data">
              Use this only when the data was entered on the wrong label. After applying, the source label's copied
              fields will be cleared.
            </InfoTooltip>
          </span>
        </label>

        <div className="copy-data-dialog-footer">
          <button className="secondary-button export-dialog-back-button" type="button" onClick={onClose}>
            Back
          </button>
          <button className="primary-button" disabled={!canApply} type="button" onClick={handleApply}>
            {primaryButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function getTargetHint(item, sourceExpectedFields) {
  if (item.result && hasDifferentCopyExpectedFields(item.expectedFields, sourceExpectedFields)) {
    return 'Verified result will be cleared if overwritten';
  }

  return hasAnyVisibleExpectedFieldValue(item.expectedFields) ? 'Has expected data' : 'Missing expected data';
}

function getQueueStatusLabel(status) {
  return QUEUE_STATUS_LABELS[status] || 'Needs Expected Data';
}

function getQueueStatusClassName(status) {
  return `queue-status queue-status-${status?.replaceAll('_', '-') || 'needs-expected-data'}`;
}
