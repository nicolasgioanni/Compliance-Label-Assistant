import { useEffect, useMemo, useState } from 'react';
import { useDismissibleDialog } from '../../hooks/useDismissibleDialog';
import { hasAnyVisibleExpectedFieldValue } from '../../utils/expectedFields';
import {
  hasBlankCopyExpectedField,
  hasDifferentCopyExpectedFields,
} from '../../utils/expectedFieldCopy';
import { getQueueItemStatusClass, getQueueItemStatusLabel } from '../../utils/statusResolution';
import InfoTooltip from '../shared/InfoTooltip';

export default function CopyClaimDataModal({ queueItems, sourceItem, onApply, onClose }) {
  const [selectedTargetIds, setSelectedTargetIds] = useState(() => new Set());
  const [shouldClearSource, setShouldClearSource] = useState(false);
  const { handleOverlayMouseDown } = useDismissibleDialog(onClose);
  const clearSourceLabelId = 'copy-data-clear-source-label';
  const targetItems = useMemo(
    () => queueItems.filter((item) => item.id !== sourceItem.id),
    [queueItems, sourceItem.id],
  );
  const hasBlankSourceFields = hasBlankCopyExpectedField(sourceItem.expectedFields);
  const [isBlankWarningVisible, setIsBlankWarningVisible] = useState(() => hasBlankSourceFields);
  const [isOverwriteWarningVisible, setIsOverwriteWarningVisible] = useState(false);
  const [isOverwriteWarningDismissedForSession, setIsOverwriteWarningDismissedForSession] = useState(false);
  const selectedTargets = targetItems.filter((item) => selectedTargetIds.has(item.id));
  const willOverwriteExpectedData = selectedTargets.some((item) =>
    hasAnyVisibleExpectedFieldValue(item.expectedFields),
  );
  const shouldShowBlankWarning = hasBlankSourceFields && isBlankWarningVisible;
  const shouldShowOverwriteWarning = willOverwriteExpectedData && isOverwriteWarningVisible;
  const shouldShowWarningStack = shouldShowBlankWarning || shouldShowOverwriteWarning;
  const canApply = selectedTargetIds.size > 0 || shouldClearSource;
  const primaryButtonLabel =
    selectedTargetIds.size === 0 && shouldClearSource ? 'Clear Source Data' : 'Apply to Selected Labels';

  useEffect(() => {
    const targetItemIds = new Set(targetItems.map((item) => item.id));
    setSelectedTargetIds((currentIds) => {
      const nextIds = new Set(Array.from(currentIds).filter((itemId) => targetItemIds.has(itemId)));
      return nextIds.size === currentIds.size ? currentIds : nextIds;
    });
  }, [targetItems]);

  useEffect(() => {
    if (!willOverwriteExpectedData) {
      setIsOverwriteWarningVisible(false);
      return;
    }

    if (!isOverwriteWarningDismissedForSession) {
      setIsOverwriteWarningVisible(true);
    }
  }, [isOverwriteWarningDismissedForSession, willOverwriteExpectedData]);

  useEffect(() => {
    if (!isBlankWarningVisible) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setIsBlankWarningVisible(false);
    }, 10000);

    return () => window.clearTimeout(timeoutId);
  }, [isBlankWarningVisible]);

  useEffect(() => {
    if (!shouldShowOverwriteWarning) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setIsOverwriteWarningVisible(false);
      setIsOverwriteWarningDismissedForSession(true);
    }, 10000);

    return () => window.clearTimeout(timeoutId);
  }, [shouldShowOverwriteWarning]);

  function handleDismissOverwriteWarning() {
    setIsOverwriteWarningVisible(false);
    setIsOverwriteWarningDismissedForSession(true);
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
        {shouldShowWarningStack ? (
          <CopyDataWarningStack
            showBlankWarning={shouldShowBlankWarning}
            showOverwriteWarning={shouldShowOverwriteWarning}
            onDismissBlankWarning={() => setIsBlankWarningVisible(false)}
            onDismissOverwriteWarning={handleDismissOverwriteWarning}
          />
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

        <CopyDataSourceBlock sourceItem={sourceItem} />

        <CopyDataToolbar
          hasSelectedTargets={selectedTargetIds.size > 0}
          hasTargets={targetItems.length > 0}
          onClearSelection={handleClearSelection}
          onSelectAll={handleSelectAll}
        />

        <CopyDataTargetList
          selectedTargetIds={selectedTargetIds}
          sourceExpectedFields={sourceItem.expectedFields}
          targetItems={targetItems}
          onToggleTarget={handleToggleTarget}
        />

        <CopyDataMoveOption
          clearSourceLabelId={clearSourceLabelId}
          isChecked={shouldClearSource}
          onChange={setShouldClearSource}
        />

        <CopyDataDialogFooter
          canApply={canApply}
          primaryButtonLabel={primaryButtonLabel}
          onApply={handleApply}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

function CopyDataWarningStack({
  showBlankWarning,
  showOverwriteWarning,
  onDismissBlankWarning,
  onDismissOverwriteWarning,
}) {
  return (
    <div className="copy-data-warning-stack" role="alert">
      {showBlankWarning ? <CopyDataBlankWarning onDismiss={onDismissBlankWarning} /> : null}
      {showOverwriteWarning ? <CopyDataOverwriteWarning onDismiss={onDismissOverwriteWarning} /> : null}
    </div>
  );
}

function CopyDataBlankWarning({ onDismiss }) {
  return (
    <div className="copy-data-warning-row">
      <span>Blank fields will also be copied.</span>
      <button
        aria-label="Dismiss blank field warning"
        className="copy-data-blank-warning-close"
        type="button"
        onClick={onDismiss}
      >
        X
      </button>
    </div>
  );
}

function CopyDataOverwriteWarning({ onDismiss }) {
  return (
    <div className="copy-data-warning-row">
      <span>Selected labels with existing expected data will be overwritten.</span>
      <button
        aria-label="Dismiss overwrite warning"
        className="copy-data-blank-warning-close"
        type="button"
        onClick={onDismiss}
      >
        X
      </button>
    </div>
  );
}

function CopyDataSourceBlock({ sourceItem }) {
  return (
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
        <span className={getQueueItemStatusClass(sourceItem)}>{getQueueItemStatusLabel(sourceItem)}</span>
      </div>
    </div>
  );
}

function CopyDataToolbar({ hasSelectedTargets, hasTargets, onClearSelection, onSelectAll }) {
  return (
    <div className="copy-data-toolbar">
      <span className="copy-data-label-row">
        <span className="copy-data-section-label">Target Labels</span>
        <InfoTooltip label="About target labels">
          Choose the labels that should receive this expected data. Labels you do not select will stay unchanged.
        </InfoTooltip>
      </span>
      <span className="copy-data-toolbar-actions">
        <button className="link-button" disabled={!hasTargets} type="button" onClick={onSelectAll}>
          Select All
        </button>
        <span className="claim-context-action-separator" aria-hidden="true" />
        <button className="link-button" disabled={!hasSelectedTargets} type="button" onClick={onClearSelection}>
          Clear Selection
        </button>
      </span>
    </div>
  );
}

function CopyDataTargetList({ selectedTargetIds, sourceExpectedFields, targetItems, onToggleTarget }) {
  return (
    <fieldset className="copy-data-list">
      <legend className="sr-only">Target labels to receive copied claim data</legend>
      {targetItems.map((item) => (
        <CopyDataTargetRow
          isSelected={selectedTargetIds.has(item.id)}
          item={item}
          key={item.id}
          sourceExpectedFields={sourceExpectedFields}
          onToggle={() => onToggleTarget(item.id)}
        />
      ))}
    </fieldset>
  );
}

function CopyDataTargetRow({ isSelected, item, sourceExpectedFields, onToggle }) {
  const filePath = item.relativePath || item.filename;

  return (
    <label className={isSelected ? 'copy-data-row copy-data-row-selected' : 'copy-data-row'}>
      <input checked={isSelected} type="checkbox" onChange={onToggle} />
      <span className="copy-data-row-copy">
        <span className="copy-data-filename" title={filePath}>
          {item.filename}
        </span>
        <span className="copy-data-row-hint">{getTargetHint(item, sourceExpectedFields)}</span>
      </span>
      <span className={getQueueItemStatusClass(item)}>{getQueueItemStatusLabel(item)}</span>
    </label>
  );
}

function CopyDataMoveOption({ clearSourceLabelId, isChecked, onChange }) {
  return (
    <label className="copy-data-move-option">
      <input
        aria-labelledby={clearSourceLabelId}
        checked={isChecked}
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="copy-data-move-label-row">
        <span id={clearSourceLabelId}>Clear data from source label after applying</span>
        <InfoTooltip label="About clearing source data">
          Use this only when the data was entered on the wrong label. After applying, the source label's copied fields
          will be cleared.
        </InfoTooltip>
      </span>
    </label>
  );
}

function CopyDataDialogFooter({ canApply, primaryButtonLabel, onApply, onClose }) {
  return (
    <div className="copy-data-dialog-footer">
      <button className="secondary-button export-dialog-back-button" type="button" onClick={onClose}>
        Back
      </button>
      <button className="primary-button" disabled={!canApply} type="button" onClick={onApply}>
        {primaryButtonLabel}
      </button>
    </div>
  );
}

function getTargetHint(item, sourceExpectedFields) {
  if (item.result && hasDifferentCopyExpectedFields(item.expectedFields, sourceExpectedFields)) {
    return 'Verified result will be cleared if overwritten';
  }

  return hasAnyVisibleExpectedFieldValue(item.expectedFields) ? 'Has expected data' : 'Missing expected data';
}
