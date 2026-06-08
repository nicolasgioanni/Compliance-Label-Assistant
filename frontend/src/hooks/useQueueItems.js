import { useEffect, useMemo, useState } from 'react';
import {
  MAX_QUEUE_FILES,
  validateExpectedFields,
} from '../utils/fileValidation';
import { buildUploadWarningMessage, planQueueFileAddition } from '../utils/queueFileValidation';
import {
  createDefaultQueueFilterIds,
  filterQueueItemsByStatus,
} from '../utils/queueStatusFilters';
import {
  canSetManualDecision,
  getQueueStatusCounts,
  hasCurrentResult,
} from '../utils/statusResolution';
import {
  applyExpectedFieldsChange,
  applyManualDecision,
  clearExpectedFieldsFromQueueItem,
  clearManualDecision,
  copyExpectedFieldsToQueueItem,
  createQueueItem,
  showFormView,
  showResultView,
} from '../utils/queueItemState';
import { useQueueRemovalAnimation } from './useQueueRemovalAnimation';
import { useQueueVerification } from './useQueueVerification';
import {
  STALE_RESULT_CHANGED_MESSAGE,
  STALE_RESULT_EDIT_MESSAGE,
} from '../constants/notificationMessages';

const MAX_QUEUE_SIZE = MAX_QUEUE_FILES;

export function useQueueItems({ showError = () => {} } = {}) {
  const [queueItems, setQueueItems] = useState([]);
  const [selectedQueueItemId, setSelectedQueueItemId] = useState(null);
  const [copyModalSourceId, setCopyModalSourceId] = useState(null);
  const [manualDecisionModalItemId, setManualDecisionModalItemId] = useState(null);
  const [selectedQueueFilterIds, setSelectedQueueFilterIds] = useState(createDefaultQueueFilterIds);
  const {
    clearRemovalState,
    handleRemoveItem: removeQueueItemWithAnimation,
    removingQueueItemIds,
  } = useQueueRemovalAnimation({
    selectedQueueItemId,
    setQueueItems,
    setSelectedQueueItemId,
    showError,
  });

  const activeQueueItems = useMemo(
    () => queueItems.filter((item) => !removingQueueItemIds.has(item.id)),
    [queueItems, removingQueueItemIds],
  );
  const visibleQueueItems = useMemo(
    () => filterQueueItemsByStatus(queueItems, selectedQueueFilterIds),
    [queueItems, selectedQueueFilterIds],
  );
  const selectedItem = activeQueueItems.find((item) => item.id === selectedQueueItemId) || null;
  const {
    handleVerifyReadyLabels,
    handleVerifySelected,
    isAnyItemVerifying,
    isVerificationBlocked,
    isVerifyingAll,
  } = useQueueVerification({
    activeQueueItems,
    selectedItem,
    showError,
    updateQueueItem,
    updateQueueItemsById,
  });
  const isQueueLocked = isAnyItemVerifying || isVerifyingAll;
  const readyQueueItems = activeQueueItems.filter((item) => item.status === 'ready');
  const queueSummary = useMemo(() => getQueueStatusCounts(activeQueueItems), [activeQueueItems]);
  const hasResultForExport = activeQueueItems.some(hasCurrentResult);
  const selectedFieldWarning = selectedItem ? validateExpectedFields(selectedItem.expectedFields) : '';
  const isVerifySelectedDisabled = !selectedItem || isQueueLocked || Boolean(selectedFieldWarning);
  const isVerifyReadyDisabled = isQueueLocked || !readyQueueItems.length;
  const copyModalSourceItem = activeQueueItems.find((item) => item.id === copyModalSourceId) || null;
  const manualDecisionModalItem = activeQueueItems.find((item) => item.id === manualDecisionModalItemId) || null;
  const copyClaimDataDisabledReason = getCopyClaimDataDisabledReason({
    activeQueueItems,
    isQueueLocked,
    selectedItem,
  });
  const canCopyClaimData = !copyClaimDataDisabledReason;

  useEffect(() => {
    if (copyModalSourceId && !copyModalSourceItem) {
      setCopyModalSourceId(null);
    }
  }, [copyModalSourceId, copyModalSourceItem]);

  useEffect(() => {
    if (manualDecisionModalItemId && !manualDecisionModalItem) {
      setManualDecisionModalItemId(null);
    }
  }, [manualDecisionModalItemId, manualDecisionModalItem]);

  function handleAddFiles(files) {
    if (isVerificationBlocked()) {
      showError('Wait for verification to finish before adding more labels.');
      return;
    }

    if (activeQueueItems.length >= MAX_QUEUE_SIZE) {
      showError(buildQueueFullMessage());
      return;
    }

    const fileAdditionPlan = planQueueFileAddition({
      activeQueueItems,
      files,
      maxQueueSize: MAX_QUEUE_SIZE,
    });
    const queueItemsToAdd = fileAdditionPlan.filesToAdd.map(createQueueItem);

    if (queueItemsToAdd.length) {
      setQueueItems((currentItems) => [...currentItems, ...queueItemsToAdd]);
      setSelectedQueueItemId((currentSelectedId) => currentSelectedId || queueItemsToAdd[0].id);
    }

    const uploadErrorMessage = buildUploadWarningMessage({
      addedCount: queueItemsToAdd.length,
      duplicateCount: fileAdditionPlan.duplicateCount,
      excludedForLimitCount: fileAdditionPlan.excludedForLimitCount,
      invalidCount: fileAdditionPlan.invalidCount,
      maxQueueSize: MAX_QUEUE_SIZE,
    });

    if (uploadErrorMessage) {
      showError(uploadErrorMessage);
    }
  }

  function handleClearQueue() {
    if (isVerificationBlocked()) {
      showError('Wait for verification to finish before clearing the queue.');
      return;
    }

    clearRemovalState();
    setQueueItems([]);
    setSelectedQueueItemId(null);
  }

  function handleToggleQueueFilter(filterId) {
    if (isQueueLocked) {
      return;
    }

    setSelectedQueueFilterIds((currentFilterIds) => {
      const nextFilterIds = new Set(currentFilterIds);
      if (nextFilterIds.has(filterId)) {
        nextFilterIds.delete(filterId);
      } else {
        nextFilterIds.add(filterId);
      }
      return nextFilterIds;
    });
  }

  function handleRemoveItem(itemId) {
    removeQueueItemWithAnimation({
      activeQueueItems,
      isBlocked: isVerificationBlocked(),
      itemId,
    });
  }

  function handleExpectedFieldsChange(nextExpectedFields) {
    if (!selectedItem || isVerificationBlocked()) {
      return;
    }

    if (hasCurrentResult(selectedItem)) {
      showError(STALE_RESULT_CHANGED_MESSAGE);
    } else if (selectedItem.errorMessage) {
      showError('');
    }

    updateQueueItem(selectedItem.id, (item) => applyExpectedFieldsChange(item, nextExpectedFields));
  }

  function handleOpenCopyClaimDataModal() {
    if (
      !selectedItem ||
      isVerificationBlocked() ||
      activeQueueItems.length < 2 ||
      !selectedItem.expectedFields.brandName?.trim()
    ) {
      return;
    }

    showError('');
    setCopyModalSourceId(selectedItem.id);
  }

  function handleCloseCopyClaimDataModal() {
    setCopyModalSourceId(null);
  }

  function handleApplyCopiedExpectedFields({ shouldClearSource, targetIds }) {
    if (!copyModalSourceItem || isVerificationBlocked()) {
      return;
    }

    const sourceId = copyModalSourceItem.id;
    const sourceExpectedFields = copyModalSourceItem.expectedFields;
    const targetIdSet = new Set(targetIds);

    showError('');
    setQueueItems((currentItems) =>
      currentItems.map((item) => {
        if (targetIdSet.has(item.id)) {
          return copyExpectedFieldsToQueueItem(item, sourceExpectedFields);
        }

        if (shouldClearSource && item.id === sourceId) {
          return clearExpectedFieldsFromQueueItem(item);
        }

        return item;
      }),
    );
    setCopyModalSourceId(null);
  }

  function handleEditExpectedData() {
    if (!selectedItem || isVerificationBlocked()) {
      return;
    }

    if (hasCurrentResult(selectedItem)) {
      showError(STALE_RESULT_EDIT_MESSAGE, { tone: 'warning' });
    }

    updateQueueItem(selectedItem.id, showFormView);
  }

  function handleBackToResults() {
    if (!selectedItem || !hasCurrentResult(selectedItem)) {
      return;
    }

    updateQueueItem(selectedItem.id, showResultView);
  }

  function handleOpenManualDecisionModal() {
    if (!canSetManualDecision(selectedItem) || isVerificationBlocked()) {
      return;
    }

    setManualDecisionModalItemId(selectedItem.id);
  }

  function handleCloseManualDecisionModal() {
    setManualDecisionModalItemId(null);
  }

  function handleApplyManualDecision(manualDecision) {
    if (!manualDecisionModalItem) {
      return;
    }

    updateQueueItem(manualDecisionModalItem.id, (item) => applyManualDecision(item, manualDecision));
    setManualDecisionModalItemId(null);
  }

  function handleClearManualDecision() {
    if (!manualDecisionModalItem) {
      return;
    }

    updateQueueItem(manualDecisionModalItem.id, clearManualDecision);
    setManualDecisionModalItemId(null);
  }

  function updateQueueItem(itemId, transition) {
    setQueueItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? transition(item) : item,
      ),
    );
  }

  function updateQueueItemsById(itemIds, transition) {
    const itemIdSet = new Set(itemIds);
    setQueueItems((currentItems) =>
      currentItems.map((item) => (itemIdSet.has(item.id) ? transition(item) : item)),
    );
  }

  return {
    activeQueueItems,
    canCopyClaimData,
    copyClaimDataDisabledReason,
    copyModalSourceItem,
    handleAddFiles,
    handleApplyCopiedExpectedFields,
    handleApplyManualDecision,
    handleBackToResults,
    handleClearManualDecision,
    handleClearQueue,
    handleCloseCopyClaimDataModal,
    handleCloseManualDecisionModal,
    handleEditExpectedData,
    handleExpectedFieldsChange,
    handleOpenCopyClaimDataModal,
    handleOpenManualDecisionModal,
    handleRemoveItem,
    handleSelectQueueItem: setSelectedQueueItemId,
    handleToggleQueueFilter,
    handleVerifyReadyLabels,
    handleVerifySelected,
    hasResultForExport,
    isQueueLocked,
    isVerifyReadyDisabled,
    isVerifySelectedDisabled,
    manualDecisionModalItem,
    maxQueueSize: MAX_QUEUE_SIZE,
    queueSummary,
    removingQueueItemIds,
    selectedItem,
    selectedQueueFilterIds,
    selectedQueueItemId,
    visibleQueueItems,
  };
}

function buildQueueFullMessage() {
  return 'Queue is full. Clear Queue before adding more labels.';
}

function getCopyClaimDataDisabledReason({ activeQueueItems, isQueueLocked, selectedItem }) {
  if (!selectedItem) {
    return 'Select a label first.';
  }

  if (activeQueueItems.length < 2) {
    return 'Add another label to copy data.';
  }

  if (!selectedItem.expectedFields.brandName?.trim()) {
    return 'Enter a brand name before copying.';
  }

  if (isQueueLocked) {
    return 'Wait for verification to finish before copying claim data.';
  }

  return '';
}
