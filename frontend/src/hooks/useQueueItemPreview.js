import { useEffect, useState } from 'react';

export function useQueueItemPreview(activeQueueItems) {
  const [previewQueueItemId, setPreviewQueueItemId] = useState(null);
  const previewQueueItem = activeQueueItems.find((item) => item.id === previewQueueItemId) || null;

  useEffect(() => {
    if (previewQueueItemId && !previewQueueItem) {
      setPreviewQueueItemId(null);
    }
  }, [previewQueueItemId, previewQueueItem]);

  function handleOpenLabelPreview(itemId) {
    if (!activeQueueItems.some((item) => item.id === itemId)) {
      return;
    }

    setPreviewQueueItemId(itemId);
  }

  function handleCloseLabelPreview() {
    setPreviewQueueItemId(null);
  }

  return {
    handleCloseLabelPreview,
    handleOpenLabelPreview,
    previewQueueItem,
  };
}
