const QUEUE_STATUS_LABELS = {
  needs_expected_data: 'Needs Expected Data',
  ready: 'Ready',
  verifying: 'Verifying',
  verified: 'Verified',
  error: 'Error',
};

export default function QueueItemCard({ item, isRemoving = false, isSelected, removeDisabled = false, onSelect, onRemove }) {
  const statusLabel = QUEUE_STATUS_LABELS[item.status] || 'Needs Expected Data';
  const statusClassName = getQueueStatusClassName(item.status);
  const queueItemClassName = ['queue-item', isSelected ? 'selected' : '', isRemoving ? 'removing' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={queueItemClassName}>
      <button
        aria-current={isSelected ? 'true' : undefined}
        className="queue-item-main"
        disabled={isRemoving}
        type="button"
        onClick={onSelect}
      >
        <span className="queue-filename">{item.filename}</span>
        <span className={statusClassName}>{statusLabel}</span>
      </button>
      <button
        aria-label={`Remove ${item.filename}`}
        className="queue-remove-button"
        disabled={removeDisabled || isRemoving}
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
