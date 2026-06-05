const QUEUE_STATUS_LABELS = {
  needs_expected_data: 'Needs Expected Data',
  ready: 'Ready',
  verifying: 'Verifying',
  verified: 'Verified',
  error: 'Error',
};

export default function QueueItemCard({ item, isSelected, removeDisabled = false, onSelect, onRemove }) {
  const statusLabel = QUEUE_STATUS_LABELS[item.status] || 'Needs Expected Data';
  const statusClassName = getQueueStatusClassName(item.status);

  return (
    <div className={isSelected ? 'queue-item selected' : 'queue-item'}>
      <button
        aria-current={isSelected ? 'true' : undefined}
        className="queue-item-main"
        type="button"
        onClick={onSelect}
      >
        <span className="queue-filename">{item.filename}</span>
        <span className={statusClassName}>{statusLabel}</span>
      </button>
      <button
        aria-label={`Remove ${item.filename}`}
        className="queue-remove-button"
        disabled={removeDisabled}
        type="button"
        onClick={onRemove}
      >
        X
      </button>
    </div>
  );
}

function getQueueStatusClassName(status) {
  return `queue-status queue-status-${status?.replaceAll('_', '-') || 'needs-expected-data'}`;
}
