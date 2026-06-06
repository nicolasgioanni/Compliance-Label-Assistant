import ImageUploadDropzone from './ImageUploadDropzone';
import InfoTooltip from './InfoTooltip';
import QueueItemCard from './QueueItemCard';

export default function LabelQueue({
  queueItems,
  removingQueueItemIds = new Set(),
  selectedQueueItemId,
  maxQueueSize,
  isLocked = false,
  onAddFiles,
  onClearQueue,
  onSelectItem,
  onRemoveItem,
}) {
  const activeQueueItemCount = queueItems.filter((item) => !removingQueueItemIds.has(item.id)).length;

  return (
    <section className="panel queue-panel">
      <div className="section-heading">
        <div className="queue-card-header">
          <div className="section-title-row">
            <h2>Label Queue</h2>
            <InfoTooltip label="About the label queue">
              Add up to {maxQueueSize} label images here. Each file becomes its own queue item with its own expected
              application data, verification status, result, and error state. Select a label in the queue to edit that
              label's expected fields, review its result, or remove it with the X button. One queued label works like a
              single verification; multiple queued labels let you verify several ready labels without sharing expected
              data between them.
            </InfoTooltip>
          </div>
          {activeQueueItemCount ? (
            <button
              className="secondary-button clear-queue-button"
              disabled={isLocked}
              type="button"
              onClick={onClearQueue}
            >
              Clear Queue
            </button>
          ) : null}
        </div>
        <p>Add label images, then select a label to edit its expected application data.</p>
      </div>
      <div className="queue-list-region">
        {queueItems.length ? (
          <div className="queue-list">
            {queueItems.map((item) => {
              const isRemoving = removingQueueItemIds.has(item.id);

              return (
                <QueueItemCard
                  isRemoving={isRemoving}
                  isSelected={item.id === selectedQueueItemId}
                  item={item}
                  key={item.id}
                  removeDisabled={isLocked || isRemoving || item.status === 'verifying'}
                  onRemove={() => onRemoveItem(item.id)}
                  onSelect={() => onSelectItem(item.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="queue-empty-state">No labels queued yet.</div>
        )}
      </div>
      <ImageUploadDropzone
        disabled={isLocked}
        maxQueueSize={maxQueueSize}
        onFilesAdded={onAddFiles}
      />
    </section>
  );
}
