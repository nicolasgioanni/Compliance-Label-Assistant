import ImageUploadDropzone from './ImageUploadDropzone';
import InfoTooltip from './InfoTooltip';
import QueueItemCard from './QueueItemCard';

export default function LabelQueue({
  queueItems,
  selectedQueueItemId,
  maxQueueSize,
  isLocked = false,
  onAddFiles,
  onSelectItem,
  onRemoveItem,
}) {
  return (
    <section className="panel queue-panel">
      <div className="section-heading">
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
        <p>Add up to {maxQueueSize} label images. Select a label to edit its expected application data.</p>
      </div>
      {queueItems.length ? (
        <div className="queue-list">
          {queueItems.map((item) => (
            <QueueItemCard
              isSelected={item.id === selectedQueueItemId}
              item={item}
              key={item.id}
              removeDisabled={isLocked || item.status === 'verifying'}
              onRemove={() => onRemoveItem(item.id)}
              onSelect={() => onSelectItem(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="queue-empty-state">No labels queued yet.</div>
      )}
      <ImageUploadDropzone
        disabled={isLocked || queueItems.length >= maxQueueSize}
        maxQueueSize={maxQueueSize}
        onFilesAdded={onAddFiles}
      />
    </section>
  );
}
