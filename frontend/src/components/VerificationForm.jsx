import { useEffect, useMemo, useRef, useState } from 'react';
import { verifySingleLabel } from '../api/verificationApi';
import CopyClaimDataModal from './CopyClaimDataModal';
import LabelQueue from './LabelQueue';
import QueueActions from './QueueActions';
import QueueSummaryBar from './QueueSummaryBar';
import SelectedLabelWorkspace from './SelectedLabelWorkspace';
import { downloadQueueResultsCsv, downloadQueueResultsXlsx } from '../utils/resultExport';
import { createEmptyExpectedFields } from '../utils/expectedFields';
import {
  clearCopiedExpectedFields,
  copyExpectedFields,
  hasDifferentCopyExpectedFields,
} from '../utils/expectedFieldCopy';
import {
  MAX_QUEUE_FILES,
  validateExpectedFields,
} from '../utils/fileValidation';
import { buildUploadWarningMessage, planQueueFileAddition } from '../utils/queueFileValidation';
import {
  createDefaultQueueFilterIds,
  filterQueueItemsByStatus,
} from '../utils/queueStatusFilters';

const MAX_QUEUE_SIZE = MAX_QUEUE_FILES;
const VERIFY_ALL_CONCURRENCY = 2;
const QUEUE_REMOVAL_ANIMATION_MS = 160;
const QUEUE_REMOVAL_SNAP_PAUSE_MS = 35;
const EMPTY_EXPECTED_FIELDS = createEmptyExpectedFields();
const CURRENT_RESULT_STATUSES = new Set(['pass', 'fail', 'needs_review']);

export default function VerificationForm({ showError = () => {} }) {
  const [queueItems, setQueueItems] = useState([]);
  const [selectedQueueItemId, setSelectedQueueItemId] = useState(null);
  const [copyModalSourceId, setCopyModalSourceId] = useState(null);
  const [isVerifyingAll, setIsVerifyingAll] = useState(false);
  const [removingQueueItemIds, setRemovingQueueItemIds] = useState(() => new Set());
  const [selectedQueueFilterIds, setSelectedQueueFilterIds] = useState(createDefaultQueueFilterIds);
  const removalTimeoutsRef = useRef(new Map());
  const verificationInFlightRef = useRef(false);

  const activeQueueItems = useMemo(
    () => queueItems.filter((item) => !removingQueueItemIds.has(item.id)),
    [queueItems, removingQueueItemIds],
  );
  const visibleQueueItems = useMemo(
    () => filterQueueItemsByStatus(queueItems, selectedQueueFilterIds),
    [queueItems, selectedQueueFilterIds],
  );
  const selectedItem = activeQueueItems.find((item) => item.id === selectedQueueItemId) || null;
  const isAnyItemVerifying = queueItems.some((item) => item.status === 'verifying');
  const isQueueLocked = isAnyItemVerifying || isVerifyingAll;
  const readyQueueItems = activeQueueItems.filter((item) => item.status === 'ready');
  const queueSummary = useMemo(() => buildQueueSummary(activeQueueItems), [activeQueueItems]);
  const hasResultForExport = activeQueueItems.some(hasCurrentResult);
  const selectedFieldWarning = selectedItem ? validateExpectedFields(selectedItem.expectedFields) : '';
  const isVerifySelectedDisabled = !selectedItem || isQueueLocked || Boolean(selectedFieldWarning);
  const isVerifyReadyDisabled = isQueueLocked || !readyQueueItems.length;
  const copyModalSourceItem = activeQueueItems.find((item) => item.id === copyModalSourceId) || null;
  const copyClaimDataDisabledReason = getCopyClaimDataDisabledReason({
    activeQueueItems,
    isQueueLocked,
    selectedItem,
  });
  const canCopyClaimData = !copyClaimDataDisabledReason;

  useEffect(
    () => () => {
      removalTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      removalTimeoutsRef.current.clear();
    },
    [],
  );

  useEffect(() => {
    if (copyModalSourceId && !copyModalSourceItem) {
      setCopyModalSourceId(null);
    }
  }, [copyModalSourceId, copyModalSourceItem]);

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

    removalTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    removalTimeoutsRef.current.clear();
    setQueueItems([]);
    setSelectedQueueItemId(null);
    setRemovingQueueItemIds(new Set());
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
    if (isVerificationBlocked()) {
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

  function handleExpectedFieldsChange(nextExpectedFields) {
    if (!selectedItem || isVerificationBlocked()) {
      return;
    }

    if (selectedItem.errorMessage) {
      showError('');
    }

    setQueueItems((currentItems) =>
      currentItems.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              expectedFields: nextExpectedFields,
              errorMessage: null,
              isResultStale: item.result ? true : item.isResultStale,
              status: getQueueStatusForExpectedFields(nextExpectedFields),
              workspaceView: 'form',
            }
          : item,
      ),
    );
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

    setQueueItems((currentItems) =>
      currentItems.map((item) => (item.id === selectedItem.id ? { ...item, workspaceView: 'form' } : item)),
    );
  }

  async function handleVerifySelected() {
    if (isVerificationBlocked()) {
      return;
    }

    if (!selectedItem) {
      showError('Add and select a label image before running verification.');
      return;
    }

    const fieldWarning = validateExpectedFields(selectedItem.expectedFields);
    if (fieldWarning) {
      showError(fieldWarning);
      return;
    }

    if (!startVerificationRun()) {
      return;
    }

    try {
      showError('');
      await verifyQueueItem(selectedItem);
    } finally {
      finishVerificationRun();
    }
  }

  async function handleVerifyReadyLabels() {
    if (isVerificationBlocked()) {
      return;
    }

    if (!activeQueueItems.length) {
      showError('Add at least one label image before running verification.');
      return;
    }

    const verificationQueue = activeQueueItems.filter((item) => item.status === 'ready');
    if (!verificationQueue.length) {
      showError('Please complete selected label review data for at least one label before verifying ready labels.');
      return;
    }

    if (!startVerificationRun()) {
      return;
    }

    showError('');
    setIsVerifyingAll(true);
    markQueueItemsVerifying(verificationQueue.map((item) => item.id));
    let nextIndex = 0;

    async function worker() {
      while (nextIndex < verificationQueue.length) {
        const item = verificationQueue[nextIndex];
        nextIndex += 1;
        await verifyQueueItem(item, { markVerifying: false });
      }
    }

    const workerCount = Math.min(VERIFY_ALL_CONCURRENCY, verificationQueue.length);
    try {
      await Promise.all(Array.from({ length: workerCount }, worker));
    } finally {
      setIsVerifyingAll(false);
      finishVerificationRun();
    }
  }

  async function verifyQueueItem(itemSnapshot, { markVerifying = true } = {}) {
    if (markVerifying) {
      markQueueItemsVerifying([itemSnapshot.id]);
    }

    try {
      const result = await verifySingleLabel(itemSnapshot.file, itemSnapshot.expectedFields);
      setQueueItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemSnapshot.id
            ? {
                ...item,
                errorMessage: null,
                isResultStale: false,
                result,
                status: result.overall_status,
                workspaceView: 'result',
              }
            : item,
        ),
      );
    } catch (error) {
      const errorMessage = getVerificationErrorMessage(error);
      setQueueItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemSnapshot.id
            ? {
                ...item,
                errorMessage,
                status: 'error',
                workspaceView: 'error',
              }
            : item,
        ),
      );
    }
  }

  function markQueueItemsVerifying(itemIds) {
    const itemIdSet = new Set(itemIds);
    setQueueItems((currentItems) =>
      currentItems.map((item) =>
        itemIdSet.has(item.id)
          ? {
              ...item,
              errorMessage: null,
              status: 'verifying',
            }
          : item,
      ),
    );
  }

  function isVerificationBlocked() {
    return isQueueLocked || verificationInFlightRef.current;
  }

  function startVerificationRun() {
    if (verificationInFlightRef.current) {
      return false;
    }

    verificationInFlightRef.current = true;
    return true;
  }

  function finishVerificationRun() {
    verificationInFlightRef.current = false;
  }

  return (
    <section className="verification-workflow">
      <div className="verification-layout">
        <div className="form-column">
          <LabelQueue
            maxQueueSize={MAX_QUEUE_SIZE}
            isLocked={isQueueLocked}
            queueItems={visibleQueueItems}
            removingQueueItemIds={removingQueueItemIds}
            selectedQueueItemId={selectedQueueItemId}
            totalQueueItemCount={activeQueueItems.length}
            selectedFilterIds={selectedQueueFilterIds}
            filtersDisabled={isQueueLocked}
            onAddFiles={handleAddFiles}
            onClearQueue={handleClearQueue}
            onRemoveItem={handleRemoveItem}
            onSelectItem={setSelectedQueueItemId}
            onToggleFilter={handleToggleQueueFilter}
          />
        </div>

        <div className="results-column">
          <QueueSummaryBar
            canExport={hasResultForExport}
            summary={queueSummary}
            onExportCsv={() => downloadQueueResultsCsv(activeQueueItems)}
            onExportXlsx={() => downloadQueueResultsXlsx(activeQueueItems)}
          />
          <SelectedLabelWorkspace
            canCopyClaimData={canCopyClaimData}
            copyClaimDataDisabledReason={copyClaimDataDisabledReason}
            isExpanded={activeQueueItems.length > 0}
            isQueueLocked={isQueueLocked}
            isVerifySelectedDisabled={isVerifySelectedDisabled}
            selectedItem={selectedItem}
            onCopyClaimData={handleOpenCopyClaimDataModal}
            onEditExpectedData={handleEditExpectedData}
            onExpectedFieldsChange={handleExpectedFieldsChange}
            onVerifySelected={handleVerifySelected}
          />
        </div>
      </div>
      <QueueActions
        isLocked={isQueueLocked}
        isVerifyReadyDisabled={isVerifyReadyDisabled}
        isVerifySelectedDisabled={isVerifySelectedDisabled}
        onVerifyReady={handleVerifyReadyLabels}
        onVerifySelected={handleVerifySelected}
      />
      {copyModalSourceItem ? (
        <CopyClaimDataModal
          queueItems={activeQueueItems}
          sourceItem={copyModalSourceItem}
          onApply={handleApplyCopiedExpectedFields}
          onClose={handleCloseCopyClaimDataModal}
        />
      ) : null}
    </section>
  );
}

function buildQueueFullMessage() {
  return 'Queue is full. Clear Queue before adding more labels.';
}

function createQueueItem(file) {
  const relativePath = getFileRelativePath(file);

  return {
    id: createClientId(),
    file,
    filename: file.name,
    relativePath,
    expectedFields: { ...EMPTY_EXPECTED_FIELDS },
    result: null,
    isResultStale: false,
    status: 'needs_expected_data',
    errorMessage: null,
    workspaceView: 'form',
  };
}

function getFileRelativePath(file) {
  return typeof file.webkitRelativePath === 'string' ? file.webkitRelativePath : '';
}

function getVerificationErrorMessage(error) {
  if (error.message === 'Failed to fetch') {
    return 'The verification service is currently unavailable. Please try again shortly.';
  }

  return error.message || 'The verification request could not be completed.';
}

function createClientId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getQueueStatusForExpectedFields(expectedFields) {
  return validateExpectedFields(expectedFields) ? 'needs_expected_data' : 'ready';
}

function copyExpectedFieldsToQueueItem(item, sourceExpectedFields) {
  if (!hasDifferentCopyExpectedFields(item.expectedFields, sourceExpectedFields)) {
    return item;
  }

  const nextExpectedFields = copyExpectedFields(item.expectedFields, sourceExpectedFields);

  return {
    ...item,
    expectedFields: nextExpectedFields,
    errorMessage: null,
    isResultStale: false,
    result: null,
    status: getQueueStatusForExpectedFields(nextExpectedFields),
    workspaceView: 'form',
  };
}

function clearExpectedFieldsFromQueueItem(item) {
  return {
    ...item,
    expectedFields: clearCopiedExpectedFields(item.expectedFields),
    errorMessage: null,
    isResultStale: false,
    result: null,
    status: 'needs_expected_data',
    workspaceView: 'form',
  };
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

function hasCurrentResult(item) {
  return Boolean(item.result && !item.isResultStale && CURRENT_RESULT_STATUSES.has(item.status));
}

function buildQueueSummary(queueItems) {
  return queueItems.reduce(
    (summary, item) => {
      summary.totalLabels += 1;

      if (item.status === 'ready') {
        summary.readyLabels += 1;
      }

      if (hasCurrentResult(item)) {
        summary.checkedCount += 1;
        summary.verifiedLabels += 1;

        if (item.result.overall_status === 'pass') {
          summary.passedCount += 1;
          summary.passCount += 1;
        } else if (item.result.overall_status === 'fail') {
          summary.failedCount += 1;
          summary.failCount += 1;
        } else if (item.result.overall_status === 'needs_review') {
          summary.failedCount += 1;
          summary.needsReviewCount += 1;
        }
      }

      if (item.status === 'error') {
        summary.checkedCount += 1;
        summary.failedCount += 1;
        summary.errorCount += 1;
      }

      return summary;
    },
    {
      totalLabels: 0,
      readyLabels: 0,
      checkedCount: 0,
      passedCount: 0,
      failedCount: 0,
      verifiedLabels: 0,
      passCount: 0,
      failCount: 0,
      needsReviewCount: 0,
      errorCount: 0,
    },
  );
}
