import { useEffect, useMemo, useRef, useState } from 'react';
import { verifySingleLabel } from '../api/verificationApi';
import LabelQueue from './LabelQueue';
import QueueActions from './QueueActions';
import SelectedLabelWorkspace from './SelectedLabelWorkspace';
import { downloadQueueResultsCsv } from '../utils/csvExport';
import { createEmptyExpectedFields } from '../utils/expectedFields';
import {
  MAX_QUEUE_FILES,
  normalizeFilename,
  validateExpectedFields,
  validateSingleFile,
} from '../utils/fileValidation';

const MAX_QUEUE_SIZE = MAX_QUEUE_FILES;
const VERIFY_ALL_CONCURRENCY = 2;
const QUEUE_REMOVAL_ANIMATION_MS = 160;
const QUEUE_REMOVAL_SNAP_PAUSE_MS = 35;
const EMPTY_EXPECTED_FIELDS = createEmptyExpectedFields();
const EXPECTED_FIELD_NAMES = Object.keys(EMPTY_EXPECTED_FIELDS);
const CURRENT_RESULT_STATUSES = new Set(['pass', 'fail', 'needs_review']);

export default function VerificationForm({ showError = () => {} }) {
  const [queueItems, setQueueItems] = useState([]);
  const [selectedQueueItemId, setSelectedQueueItemId] = useState(null);
  const [isVerifyingAll, setIsVerifyingAll] = useState(false);
  const [removingQueueItemIds, setRemovingQueueItemIds] = useState(() => new Set());
  const removalTimeoutsRef = useRef(new Map());

  const activeQueueItems = useMemo(
    () => queueItems.filter((item) => !removingQueueItemIds.has(item.id)),
    [queueItems, removingQueueItemIds],
  );
  const selectedItem = activeQueueItems.find((item) => item.id === selectedQueueItemId) || null;
  const isAnyItemVerifying = queueItems.some((item) => item.status === 'verifying');
  const isQueueLocked = isAnyItemVerifying || isVerifyingAll;
  const readyQueueItems = activeQueueItems.filter((item) => item.status === 'ready');
  const queueSummary = useMemo(() => buildQueueSummary(activeQueueItems), [activeQueueItems]);
  const hasQueueOutcome = activeQueueItems.some((item) => hasCurrentResult(item) || item.status === 'error');
  const hasResultForExport = activeQueueItems.some(hasCurrentResult);
  const selectedFieldWarning = selectedItem ? validateExpectedFields(selectedItem.expectedFields) : '';
  const isVerifySelectedDisabled = !selectedItem || isQueueLocked || Boolean(selectedFieldWarning);
  const isVerifyReadyDisabled = isQueueLocked || !readyQueueItems.length;

  useEffect(
    () => () => {
      removalTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      removalTimeoutsRef.current.clear();
    },
    [],
  );

  function handleAddFiles(files) {
    if (isQueueLocked) {
      showError('Wait for verification to finish before adding more labels.');
      return;
    }

    if (activeQueueItems.length >= MAX_QUEUE_SIZE) {
      showError(buildQueueFullMessage());
      return;
    }

    const filesToAdd = [];
    const existingFileKeys = new Set(activeQueueItems.map((item) => normalizeFilename(getQueueItemFileKey(item))));
    const selectedFileKeys = new Set();
    let duplicateCount = 0;
    let invalidCount = 0;
    let excludedForLimitCount = 0;

    files.forEach((file) => {
      const normalizedFileKey = normalizeFilename(getFileQueueKey(file));
      if (normalizedFileKey && (existingFileKeys.has(normalizedFileKey) || selectedFileKeys.has(normalizedFileKey))) {
        duplicateCount += 1;
        return;
      }

      const fileWarning = validateSingleFile(file);
      if (fileWarning) {
        invalidCount += 1;
        return;
      }

      if (activeQueueItems.length + filesToAdd.length >= MAX_QUEUE_SIZE) {
        excludedForLimitCount += 1;
        return;
      }

      if (normalizedFileKey) {
        selectedFileKeys.add(normalizedFileKey);
      }

      filesToAdd.push(createQueueItem(file));
    });

    if (filesToAdd.length) {
      setQueueItems((currentItems) => [...currentItems, ...filesToAdd]);
      setSelectedQueueItemId((currentSelectedId) => currentSelectedId || filesToAdd[0].id);
    }

    const uploadErrorMessage = buildUploadWarningMessage({
      addedCount: filesToAdd.length,
      duplicateCount,
      excludedForLimitCount,
      invalidCount,
    });

    if (uploadErrorMessage) {
      showError(uploadErrorMessage);
    }
  }

  function handleClearQueue() {
    if (isQueueLocked) {
      showError('Wait for verification to finish before clearing the queue.');
      return;
    }

    removalTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    removalTimeoutsRef.current.clear();
    setQueueItems([]);
    setSelectedQueueItemId(null);
    setRemovingQueueItemIds(new Set());
  }

  function handleRemoveItem(itemId) {
    if (isQueueLocked) {
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
    if (!selectedItem || isQueueLocked) {
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

  function handleApplyExpectedFieldsToAll() {
    if (!selectedItem || isQueueLocked) {
      return;
    }

    showError('');
    setQueueItems((currentItems) =>
      currentItems.map((item) => applyExpectedFieldsToItem(item, selectedItem.expectedFields)),
    );
  }

  function handleEditExpectedData() {
    if (!selectedItem || isQueueLocked) {
      return;
    }

    setQueueItems((currentItems) =>
      currentItems.map((item) => (item.id === selectedItem.id ? { ...item, workspaceView: 'form' } : item)),
    );
  }

  async function handleVerifySelected() {
    if (isQueueLocked) {
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

    showError('');
    await verifyQueueItem(selectedItem);
  }

  async function handleVerifyReadyLabels() {
    if (isQueueLocked) {
      return;
    }

    if (!activeQueueItems.length) {
      showError('Add at least one label image before running verification.');
      return;
    }

    const verificationQueue = activeQueueItems.filter((item) => item.status === 'ready');
    if (!verificationQueue.length) {
      showError('Please complete expected application data for at least one label before verifying ready labels.');
      return;
    }

    showError('');
    setIsVerifyingAll(true);
    let nextIndex = 0;

    async function worker() {
      while (nextIndex < verificationQueue.length) {
        const item = verificationQueue[nextIndex];
        nextIndex += 1;
        await verifyQueueItem(item);
      }
    }

    const workerCount = Math.min(VERIFY_ALL_CONCURRENCY, verificationQueue.length);
    try {
      await Promise.all(Array.from({ length: workerCount }, worker));
    } finally {
      setIsVerifyingAll(false);
    }
  }

  async function verifyQueueItem(itemSnapshot) {
    setQueueItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemSnapshot.id
          ? {
              ...item,
              errorMessage: null,
              status: 'verifying',
            }
          : item,
      ),
    );

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

  return (
    <section className="verification-workflow">
      <div className="verification-layout">
        <div className="form-column">
          <LabelQueue
            maxQueueSize={MAX_QUEUE_SIZE}
            isLocked={isQueueLocked}
            queueItems={queueItems}
            removingQueueItemIds={removingQueueItemIds}
            selectedQueueItemId={selectedQueueItemId}
            onAddFiles={handleAddFiles}
            onClearQueue={handleClearQueue}
            onRemoveItem={handleRemoveItem}
            onSelectItem={setSelectedQueueItemId}
          />
        </div>

        <div className="results-column">
          <SelectedLabelWorkspace
            canApplyToAll={activeQueueItems.length > 1}
            canExportResults={hasResultForExport}
            isExpanded={activeQueueItems.length > 0}
            isQueueLocked={isQueueLocked}
            isVerifySelectedDisabled={isVerifySelectedDisabled}
            queueSummary={queueSummary}
            selectedItem={selectedItem}
            showQueueSummary={hasQueueOutcome}
            verifyingMode={isVerifyingAll ? 'queue' : 'single'}
            onApplyExpectedFieldsToAll={handleApplyExpectedFieldsToAll}
            onEditExpectedData={handleEditExpectedData}
            onExpectedFieldsChange={handleExpectedFieldsChange}
            onExportCsv={() => downloadQueueResultsCsv(activeQueueItems)}
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
    </section>
  );
}

function buildQueueFullMessage() {
  return 'Queue is full. Clear Queue before adding more labels.';
}

function buildUploadWarningMessage({ addedCount, duplicateCount, excludedForLimitCount, invalidCount }) {
  const warningParts = [];

  if (invalidCount > 0) {
    warningParts.push(`Skipped ${invalidCount} unsupported or oversized ${pluralizeFile(invalidCount)}.`);
  }

  if (duplicateCount > 0) {
    warningParts.push(`Skipped ${duplicateCount} duplicate ${pluralizeFile(duplicateCount)}.`);
  }

  if (excludedForLimitCount > 0) {
    warningParts.push(
      `Skipped ${excludedForLimitCount} ${pluralizeFile(excludedForLimitCount)} because the queue limit is ${MAX_QUEUE_SIZE} labels.`,
    );
  }

  if (!warningParts.length) {
    return '';
  }

  const addedMessage =
    addedCount > 0
      ? `Added ${addedCount} label ${addedCount === 1 ? 'image' : 'images'}.`
      : 'No label images were added.';

  return [addedMessage, ...warningParts].join(' ');
}

function pluralizeFile(count) {
  return count === 1 ? 'file' : 'files';
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

function getQueueItemFileKey(item) {
  return item.relativePath || item.filename;
}

function getFileQueueKey(file) {
  return getFileRelativePath(file) || file.name;
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

function applyExpectedFieldsToItem(item, expectedFields) {
  if (areExpectedFieldsEqual(item.expectedFields, expectedFields)) {
    return item;
  }

  const nextExpectedFields = { ...expectedFields };

  return {
    ...item,
    expectedFields: nextExpectedFields,
    errorMessage: null,
    isResultStale: item.result ? true : item.isResultStale,
    status: getQueueStatusForExpectedFields(nextExpectedFields),
    workspaceView: 'form',
  };
}

function areExpectedFieldsEqual(leftFields, rightFields) {
  return EXPECTED_FIELD_NAMES.every((fieldName) => leftFields[fieldName] === rightFields[fieldName]);
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
        summary.verifiedLabels += 1;

        if (item.result.overall_status === 'pass') {
          summary.passCount += 1;
        } else if (item.result.overall_status === 'fail') {
          summary.failCount += 1;
        } else if (item.result.overall_status === 'needs_review') {
          summary.needsReviewCount += 1;
        }
      }

      if (item.status === 'error') {
        summary.errorCount += 1;
      }

      return summary;
    },
    {
      totalLabels: 0,
      readyLabels: 0,
      verifiedLabels: 0,
      passCount: 0,
      failCount: 0,
      needsReviewCount: 0,
      errorCount: 0,
    },
  );
}
