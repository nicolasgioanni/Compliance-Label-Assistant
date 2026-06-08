import { useState } from 'react';
import ExportResultsDialog from '../dialogs/ExportResultsDialog';
import InfoTooltip from '../shared/InfoTooltip';

const SUMMARY_ITEMS = [
  ['checkedCount', 'Checked'],
  ['passedCount', 'Passed'],
  ['failedCount', 'Failed'],
];

export default function QueueSummaryBar({ canExport = false, onExportCsv, onExportError, onExportXlsx, summary }) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  if (!summary) {
    return null;
  }

  const status = getQueueSummaryStatus(summary);
  const exportButtonClassName = canExport
    ? 'primary-button queue-summary-export'
    : 'secondary-button queue-summary-export';

  function handleExportClick() {
    if (canExport) {
      setIsExportDialogOpen(true);
    }
  }

  return (
    <section className="panel queue-summary-panel" aria-label="Queue summary">
      <div className="queue-summary-heading">
        <h2>Results Summary</h2>
        <InfoTooltip label="About results summary">
          Shows how many queued labels have been checked, how many passed or failed, the current queue status, and
          export options for verified results. Overall status values come from automated verification results.
        </InfoTooltip>
      </div>
      <div className="queue-summary-primary-row">
        <dl className="queue-summary-list">
          {SUMMARY_ITEMS.map(([key, label]) => (
            <div className="queue-summary-stat" key={key}>
              <dt>{label}</dt>
              <dd>{summary[key] ?? 0}</dd>
            </div>
          ))}
        </dl>
        <button
          className={exportButtonClassName}
          disabled={!canExport}
          type="button"
          onClick={handleExportClick}
        >
          Export Results
        </button>
      </div>
      <div className="queue-summary-status-row">
        <span className="queue-summary-status-label">Status:</span>
        <span className={`queue-summary-status-pill queue-summary-status-pill-${status.tone}`}>
          <span>{status.label}</span>
          <InfoTooltip label={status.tooltipLabel}>{status.tooltipText}</InfoTooltip>
        </span>
      </div>
      {isExportDialogOpen ? (
        <ExportResultsDialog
          onClose={() => setIsExportDialogOpen(false)}
          onDownloadCsv={onExportCsv}
          onDownloadError={onExportError}
          onDownloadXlsx={onExportXlsx}
        />
      ) : null}
    </section>
  );
}

function getQueueSummaryStatus(summary) {
  if (summary.totalLabels < 1) {
    return {
      label: 'No Labels Queued Yet',
      tone: 'neutral',
      tooltipLabel: 'About empty queue status',
      tooltipText: 'Add labels to the queue to populate these metrics and enable verification.',
    };
  }

  if (summary.checkedCount < 1) {
    return {
      label: 'Needs Review',
      tone: 'warning',
      tooltipLabel: 'About queue review status',
      tooltipText: 'Verify the selected label or ready labels to populate checked, passed, and failed results.',
    };
  }

  if (summary.failedCount > 0) {
    const failedLabelCount = summary.failedCount;

    return {
      label: `${failedLabelCount} ${pluralizeLabel(failedLabelCount)} ${pluralizeAction(failedLabelCount)} Attention`,
      tone: 'danger',
      tooltipLabel: 'About labels needing attention',
      tooltipText: getAttentionTooltipText(summary),
    };
  }

  if (summary.checkedCount === summary.totalLabels) {
    return {
      label: 'All Labels Passed',
      tone: 'success',
      tooltipLabel: 'About passed queue results',
      tooltipText: 'Every label currently in the Label Queue has been checked and passed verification.',
    };
  }

  return {
    label: 'Checked Labels Passed',
    tone: 'success',
    tooltipLabel: 'About checked queue results',
    tooltipText: 'Checked labels passed. Remaining labels still need to be prepared or verified from the Label Queue.',
  };
}

function pluralizeLabel(count) {
  return count === 1 ? 'Label' : 'Labels';
}

function pluralizeAction(count) {
  return count === 1 ? 'Needs' : 'Need';
}

function getAttentionTooltipText(summary) {
  return `Informational status only. This includes ${formatBreakdownCount(
    summary.failCount,
    'Fail result',
  )}, ${formatBreakdownCount(summary.needsReviewCount, 'Needs Review result')}, and ${formatBreakdownCount(
    summary.errorCount,
    'Error result',
  )}. Overall status comes from automated verification and cannot be changed manually.`;
}

function formatBreakdownCount(count, label) {
  return `${count ?? 0} ${label}${count === 1 ? '' : 's'}`;
}
