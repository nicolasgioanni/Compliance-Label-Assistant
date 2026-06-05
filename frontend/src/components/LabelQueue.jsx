import ImageUploadDropzone from './ImageUploadDropzone';
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
        <h2>Label Queue</h2>
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
