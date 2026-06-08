import { useEffect, useRef, useState } from 'react';

const QUEUE_REMOVAL_ANIMATION_MS = 160;
const QUEUE_REMOVAL_SNAP_PAUSE_MS = 35;

export function useQueueRemovalAnimation({
  selectedQueueItemId,
  setQueueItems,
  setSelectedQueueItemId,
  showError = () => {},
}) {
  const [removingQueueItemIds, setRemovingQueueItemIds] = useState(() => new Set());
  const removalTimeoutsRef = useRef(new Map());

  useEffect(
    () => () => {
      clearRemovalTimeouts(removalTimeoutsRef.current);
    },
    [],
  );

  function clearRemovalState() {
    clearRemovalTimeouts(removalTimeoutsRef.current);
    setRemovingQueueItemIds(new Set());
  }

  function handleRemoveItem({ activeQueueItems, isBlocked, itemId }) {
    if (isBlocked) {
      showError('Wait for verification to finish before removing labels.');
      return;
    }

    if (removingQueueItemIds.has(itemId) || removalTimeoutsRef.current.has(itemId)) {
      return;
    }

    const removeIndex = activeQueueItems.findIndex((item) => item.id === itemId);
    if (removeIndex === -1) {
      return;
    }

    showError('');
    const nextItems = activeQueueItems.filter((item) => item.id !== itemId);

    if (itemId === selectedQueueItemId) {
      const nextSelectedItem = nextItems[removeIndex] || nextItems[removeIndex - 1] || null;
      setSelectedQueueItemId(nextSelectedItem?.id || null);
    }

    setRemovingQueueItemIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.add(itemId);
      return nextIds;
    });

    const timeoutId = setTimeout(() => {
      setQueueItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
      setRemovingQueueItemIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(itemId);
        return nextIds;
      });
      removalTimeoutsRef.current.delete(itemId);
    }, QUEUE_REMOVAL_ANIMATION_MS + QUEUE_REMOVAL_SNAP_PAUSE_MS);

    removalTimeoutsRef.current.set(itemId, timeoutId);
  }

  return {
    clearRemovalState,
    handleRemoveItem,
    removingQueueItemIds,
  };
}

function clearRemovalTimeouts(removalTimeouts) {
  removalTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
  removalTimeouts.clear();
}
