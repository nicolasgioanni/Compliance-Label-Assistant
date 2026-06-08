import { getQueueItemStatusClass, getQueueItemStatusLabel } from '../../utils/statusResolution';

export default function QueueItemCard({
  item,
  isRemoving = false,
  isSelected,
  removeDisabled = false,
  onPreview = () => {},
  onSelect,
  onRemove,
}) {
  const statusLabel = getQueueItemStatusLabel(item);
  const statusClassName = getQueueItemStatusClass(item);
  const queueItemClassName = ['queue-item', isSelected ? 'selected' : '', isRemoving ? 'removing' : '']
    .filter(Boolean)
    .join(' ');
  const filename = item.filename;

  return (
    <div className={queueItemClassName}>
      <div className="queue-item-content">
        <button
          aria-current={isSelected ? 'true' : undefined}
          aria-label={`${isSelected ? 'Selected label' : 'Select label'} ${filename}, status ${statusLabel}`}
          className="queue-item-main"
          disabled={isRemoving}
          type="button"
          onClick={onSelect}
        >
          <span className="queue-file-copy" title={filename}>
            <span className="queue-filename">{filename}</span>
          </span>
          <span className={statusClassName}>
            {item.status === 'verifying' ? (
              <span className="loading-spinner queue-status-spinner" aria-hidden="true" />
            ) : null}
            {statusLabel}
          </span>
        </button>
        <button
          aria-label={`Preview ${filename}`}
          className="queue-preview-button"
          disabled={isRemoving}
          type="button"
          onClick={onPreview}
        >
          Preview
        </button>
      </div>
      <button
        aria-label={`Remove ${filename}`}
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
