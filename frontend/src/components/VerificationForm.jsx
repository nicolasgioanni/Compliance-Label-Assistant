import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { verifySingleLabel } from '../api/verificationApi';
import ExpectedFieldsForm from './ExpectedFieldsForm';
import ExtractedTextPanel from './ExtractedTextPanel';
import FieldResultCard from './FieldResultCard';
import InfoTooltip from './InfoTooltip';
import LabelQueue from './LabelQueue';
import LoadingState from './LoadingState';
import ResultsSummary from './ResultsSummary';
import { downloadQueueResultsCsv } from '../utils/csvExport';
import {
  MAX_FILE_SIZE_MB,
  MAX_QUEUE_FILES,
  SUPPORTED_IMAGE_DESCRIPTION,
  buildDuplicateFilesMessage,
  normalizeFilename,
  validateExpectedFields,
  validateSingleFile,
} from '../utils/fileValidation';

const MAX_QUEUE_SIZE = MAX_QUEUE_FILES;
const VERIFY_ALL_CONCURRENCY = 2;
const QUEUE_REMOVAL_ANIMATION_MS = 90;

const EMPTY_EXPECTED_FIELDS = {
  brandName: '',
  classType: '',
  alcoholContent: '',
  netContents: '',
  governmentWarning: '',
};

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
  const queueSummary = useMemo(() => buildQueueSummary(activeQueueItems), [activeQueueItems]);
  const hasQueueOutcome = activeQueueItems.some((item) => item.result || item.status === 'error');
  const hasResultForExport = activeQueueItems.some((item) => item.result);
  const clearItemErrorMessage = useCallback((itemId) => {
    setQueueItems((currentItems) =>
      currentItems.map((item) => (item.id === itemId ? { ...item, errorMessage: null } : item)),
    );
  }, []);

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

    const filesToAdd = [];
    const existingFilenames = new Set(activeQueueItems.map((item) => normalizeFilename(item.filename)));
    const selectedFilenames = new Set();
    let duplicateCount = 0;
    let invalidCount = 0;
    let excludedForLimitCount = 0;

    files.forEach((file) => {
      const normalizedFilename = normalizeFilename(file.name);
      if (normalizedFilename && (existingFilenames.has(normalizedFilename) || selectedFilenames.has(normalizedFilename))) {
        duplicateCount += 1;
        return;
      }

      if (normalizedFilename) {
        selectedFilenames.add(normalizedFilename);
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

      filesToAdd.push(createQueueItem(file));
    });

    if (filesToAdd.length) {
      setQueueItems((currentItems) => [...currentItems, ...filesToAdd]);
      setSelectedQueueItemId((currentSelectedId) => currentSelectedId || filesToAdd[0].id);
    }

    const uploadWarnings = [];
    if (duplicateCount > 0) {
      uploadWarnings.push(buildDuplicateFilesMessage(duplicateCount));
    }
    if (excludedForLimitCount > 0) {
      uploadWarnings.push(buildLimitExceededMessage(excludedForLimitCount));
    }
    if (invalidCount > 0) {
      uploadWarnings.push(
        `Some files could not be added. Upload ${SUPPORTED_IMAGE_DESCRIPTION} images smaller than ${MAX_FILE_SIZE_MB} MB.`,
      );
    }

    if (uploadWarnings.length) {
      showError(uploadWarnings.join(' '));
    } else {
      showError('');
    }
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
    }, QUEUE_REMOVAL_ANIMATION_MS);

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
              result: null,
              status: getQueueStatusForExpectedFields(nextExpectedFields),
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

  async function handleVerifySelected() {
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

  async function handleVerifyAll() {
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
                result,
                status: 'verified',
              }
            : item,
        ),
      );
    } catch (error) {
      const errorMessage = getVerificationErrorMessage(error);
      showError(errorMessage, { onDismiss: () => clearItemErrorMessage(itemSnapshot.id) });
      setQueueItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemSnapshot.id
            ? {
                ...item,
                errorMessage,
                result: null,
                status: 'error',
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
            onRemoveItem={handleRemoveItem}
            onSelectItem={setSelectedQueueItemId}
          />
        </div>

        <div className="results-column">
          <section
            className={
              selectedItem
                ? 'panel expected-data-panel expected-data-panel-active'
                : 'panel expected-data-panel expected-data-panel-empty empty-state'
            }
          >
            {selectedItem ? (
              <ExpectedFieldsForm
                canApplyToAll={activeQueueItems.length > 1}
                contextFilename={selectedItem.filename}
                disabled={isQueueLocked}
                expectedFields={selectedItem.expectedFields}
                onApplyToAll={handleApplyExpectedFieldsToAll}
                onChange={handleExpectedFieldsChange}
              />
            ) : (
              <>
                <div className="section-title-row">
                  <h2>Expected Application Data</h2>
                  <InfoTooltip label="About expected application data before adding labels">
                    This panel becomes editable after you add a label image to the queue. Start by using the upload
                    control in the Label Queue, then select the queued label you want to prepare. Once selected, this
                    section will show the fields that describe what the label should match: brand name, class or type,
                    alcohol content, net contents, and government warning text. Each queued label gets its own copy of
                    those fields, so you can prepare one label at a time before verification.
                  </InfoTooltip>
                </div>
                <p>Add a label image to enter expected application data.</p>
              </>
            )}
          </section>
          {isQueueLocked ? <LoadingState mode={isVerifyingAll ? 'queue' : 'single'} /> : null}
          {hasQueueOutcome ? (
            <>
              <QueueSummary summary={queueSummary} />
              {hasResultForExport ? (
                <div className="result-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => downloadQueueResultsCsv(activeQueueItems)}
                  >
                    Export CSV
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
          {selectedItem?.result ? <ResultsSummary result={selectedItem.result} /> : null}
          {hasQueueOutcome && selectedItem && !selectedItem.result && !selectedItem.errorMessage ? (
            <SelectedPendingState filename={selectedItem.filename} />
          ) : null}
          {selectedItem?.result?.field_results?.length ? (
            <section className="result-grid">
              {selectedItem.result.field_results.map((fieldResult) => (
                <FieldResultCard key={fieldResult.field_name} result={fieldResult} />
              ))}
            </section>
          ) : null}
          <ExtractedTextPanel extractedFields={selectedItem?.result?.extracted_fields} />
        </div>
      </div>

      <div className="verification-actions">
        <button
          className="primary-button"
          disabled={!selectedItem || isQueueLocked}
          type="button"
          onClick={handleVerifySelected}
        >
          Verify Selected Label
        </button>
        <button
          className="secondary-button"
          disabled={!activeQueueItems.length || isQueueLocked}
          type="button"
          onClick={handleVerifyAll}
        >
          Verify Ready Labels
        </button>
      </div>
    </section>
  );
}

function buildLimitExceededMessage(excludedFileCount) {
  const fileLabel = excludedFileCount === 1 ? 'file was' : 'files were';
  return `Too many files uploaded. ${excludedFileCount} ${fileLabel} excluded because the queue limit is ${MAX_QUEUE_SIZE}.`;
}

function SelectedPendingState({ filename }) {
  return (
    <section className="panel empty-state result-empty-state">
      <h2>Selected label not verified</h2>
      <p>{filename} has not been verified yet.</p>
    </section>
  );
}

function QueueSummary({ summary }) {
  return (
    <section className="panel queue-summary">
      <div>
        <p className="summary-label">Total Labels</p>
        <strong>{summary.totalLabels}</strong>
      </div>
      <div>
        <p className="summary-label">Ready Labels</p>
        <strong>{summary.readyLabels}</strong>
      </div>
      <div>
        <p className="summary-label">Verified Labels</p>
        <strong>{summary.verifiedLabels}</strong>
      </div>
      <div>
        <p className="summary-label">Pass</p>
        <strong>{summary.passCount}</strong>
      </div>
      <div>
        <p className="summary-label">Fail</p>
        <strong>{summary.failCount}</strong>
      </div>
      <div>
        <p className="summary-label">Needs Review</p>
        <strong>{summary.needsReviewCount}</strong>
      </div>
      <div>
        <p className="summary-label">Error</p>
        <strong>{summary.errorCount}</strong>
      </div>
    </section>
  );
}

function createQueueItem(file) {
  return {
    id: createClientId(),
    file,
    filename: file.name,
    expectedFields: { ...EMPTY_EXPECTED_FIELDS },
    result: null,
    status: 'needs_expected_data',
    errorMessage: null,
  };
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
    result: null,
    status: getQueueStatusForExpectedFields(nextExpectedFields),
  };
}

function areExpectedFieldsEqual(leftFields, rightFields) {
  return Object.keys(EMPTY_EXPECTED_FIELDS).every((fieldName) => leftFields[fieldName] === rightFields[fieldName]);
}

function buildQueueSummary(queueItems) {
  return queueItems.reduce(
    (summary, item) => {
      const overallStatus = item.result?.overall_status || (item.status === 'error' ? 'error' : null);

      summary.totalLabels += 1;

      if (item.status === 'ready') {
        summary.readyLabels += 1;
      }

      if (item.result) {
        summary.verifiedLabels += 1;
      }

      if (overallStatus === 'pass') {
        summary.passCount += 1;
      } else if (overallStatus === 'fail') {
        summary.failCount += 1;
      } else if (overallStatus === 'needs_review') {
        summary.needsReviewCount += 1;
      } else if (overallStatus === 'error') {
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
