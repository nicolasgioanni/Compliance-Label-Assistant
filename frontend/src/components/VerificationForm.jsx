import { useCallback, useMemo, useState } from 'react';
import { verifySingleLabel } from '../api/verificationApi';
import ErrorBanner from './ErrorBanner';
import ExpectedFieldsForm from './ExpectedFieldsForm';
import ExtractedTextPanel from './ExtractedTextPanel';
import FieldResultCard from './FieldResultCard';
import LabelQueue from './LabelQueue';
import LoadingState from './LoadingState';
import ResultsSummary from './ResultsSummary';
import { downloadQueueResultsCsv } from '../utils/csvExport';
import { MAX_FILE_SIZE_MB, MAX_QUEUE_FILES, validateExpectedFields, validateSingleFile } from '../utils/fileValidation';

const MAX_QUEUE_SIZE = MAX_QUEUE_FILES;
const VERIFY_ALL_CONCURRENCY = 2;

const EMPTY_EXPECTED_FIELDS = {
  brandName: '',
  classType: '',
  alcoholContent: '',
  netContents: '',
  governmentWarning: '',
};

export default function VerificationForm() {
  const [queueItems, setQueueItems] = useState([]);
  const [selectedQueueItemId, setSelectedQueueItemId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifyingAll, setIsVerifyingAll] = useState(false);

  const selectedItem = queueItems.find((item) => item.id === selectedQueueItemId) || null;
  const isAnyItemVerifying = queueItems.some((item) => item.status === 'verifying');
  const isQueueLocked = isAnyItemVerifying || isVerifyingAll;
  const queueSummary = useMemo(() => buildQueueSummary(queueItems), [queueItems]);
  const hasQueueOutcome = queueItems.some((item) => item.result || item.status === 'error');
  const hasResultForExport = queueItems.some((item) => item.result);
  const activeErrorMessage = errorMessage || selectedItem?.errorMessage || '';
  const dismissActiveError = useCallback(() => {
    if (errorMessage) {
      setErrorMessage('');
      return;
    }

    if (!selectedItem?.errorMessage) {
      return;
    }

    const selectedItemId = selectedItem.id;
    setQueueItems((currentItems) =>
      currentItems.map((item) => (item.id === selectedItemId ? { ...item, errorMessage: null } : item)),
    );
  }, [errorMessage, selectedItem?.errorMessage, selectedItem?.id]);

  function handleAddFiles(files) {
    setErrorMessage('');

    if (isQueueLocked) {
      setErrorMessage('Wait for verification to finish before adding more labels.');
      return;
    }

    if (queueItems.length >= MAX_QUEUE_SIZE) {
      setErrorMessage('The label queue is full. Remove a label before adding another.');
      return;
    }

    const availableSlots = MAX_QUEUE_SIZE - queueItems.length;
    const filesToAdd = [];
    const filesToValidate = files.slice(0, availableSlots);
    const excludedForLimitCount = Math.max(files.length - availableSlots, 0);
    let hasInvalidFile = false;

    filesToValidate.forEach((file) => {
      const fileWarning = validateSingleFile(file);
      if (fileWarning) {
        hasInvalidFile = true;
        return;
      }

      filesToAdd.push(createQueueItem(file));
    });

    if (filesToAdd.length) {
      setQueueItems((currentItems) => [...currentItems, ...filesToAdd]);
      setSelectedQueueItemId((currentSelectedId) => currentSelectedId || filesToAdd[0].id);
    }

    if (excludedForLimitCount > 0) {
      setErrorMessage(buildLimitExceededMessage(excludedForLimitCount));
    } else if (hasInvalidFile) {
      setErrorMessage(`Some files could not be added. Upload JPG or PNG images smaller than ${MAX_FILE_SIZE_MB} MB.`);
    }
  }

  function handleRemoveItem(itemId) {
    if (isQueueLocked) {
      setErrorMessage('Wait for verification to finish before removing labels.');
      return;
    }

    setErrorMessage('');
    const removeIndex = queueItems.findIndex((item) => item.id === itemId);
    const nextItems = queueItems.filter((item) => item.id !== itemId);

    setQueueItems(nextItems);

    if (itemId === selectedQueueItemId) {
      const nextSelectedItem = nextItems[removeIndex] || nextItems[removeIndex - 1] || null;
      setSelectedQueueItemId(nextSelectedItem?.id || null);
    }
  }

  function handleExpectedFieldsChange(nextExpectedFields) {
    if (!selectedItem || isQueueLocked) {
      return;
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

    setErrorMessage('');
    setQueueItems((currentItems) =>
      currentItems.map((item) => applyExpectedFieldsToItem(item, selectedItem.expectedFields)),
    );
  }

  async function handleVerifySelected() {
    if (!selectedItem) {
      setErrorMessage('Add and select a label image before running verification.');
      return;
    }

    const fieldWarning = validateExpectedFields(selectedItem.expectedFields);
    if (fieldWarning) {
      setErrorMessage(fieldWarning);
      return;
    }

    setErrorMessage('');
    await verifyQueueItem(selectedItem);
  }

  async function handleVerifyAll() {
    if (!queueItems.length) {
      setErrorMessage('Add at least one label image before running verification.');
      return;
    }

    const verificationQueue = queueItems.filter((item) => item.status === 'ready');
    if (!verificationQueue.length) {
      const incompleteItem = queueItems.find((item) => item.status === 'needs_expected_data');
      if (incompleteItem) {
        setSelectedQueueItemId(incompleteItem.id);
        setErrorMessage(`Complete expected application data for ${incompleteItem.filename} before verifying ready labels.`);
      } else {
        setErrorMessage('No ready labels to verify. Add a label or edit expected application data before running verification.');
      }
      return;
    }

    setErrorMessage('');
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
      setQueueItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemSnapshot.id
            ? {
                ...item,
                errorMessage: getVerificationErrorMessage(error),
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
            selectedQueueItemId={selectedQueueItemId}
            onAddFiles={handleAddFiles}
            onRemoveItem={handleRemoveItem}
            onSelectItem={setSelectedQueueItemId}
          />
        </div>

        <div className="results-column">
          {selectedItem ? (
            <ExpectedFieldsForm
              canApplyToAll={queueItems.length > 1}
              contextFilename={selectedItem.filename}
              disabled={isQueueLocked}
              expectedFields={selectedItem.expectedFields}
              onApplyToAll={handleApplyExpectedFieldsToAll}
              onChange={handleExpectedFieldsChange}
            />
          ) : (
            <section className="panel empty-state">
              <h2>Expected Application Data</h2>
              <p>Add a label image to enter expected application data.</p>
            </section>
          )}
          <ErrorBanner message={activeErrorMessage} stackIndex={1} onDismiss={dismissActiveError} />
          {isQueueLocked ? <LoadingState mode={isVerifyingAll ? 'queue' : 'single'} /> : null}
          {hasQueueOutcome ? (
            <>
              <QueueSummary summary={queueSummary} />
              {hasResultForExport ? (
                <div className="result-actions">
                  <button className="secondary-button" type="button" onClick={() => downloadQueueResultsCsv(queueItems)}>
                    Export CSV
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
          {selectedItem?.result ? <ResultsSummary result={selectedItem.result} /> : null}
          {!hasQueueOutcome && !selectedItem?.result && !selectedItem?.errorMessage ? <ReadyState /> : null}
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
          disabled={!queueItems.length || isQueueLocked}
          type="button"
          onClick={handleVerifyAll}
        >
          Verify Ready Labels
        </button>
      </div>
    </section>
  );
}

function ReadyState() {
  return (
    <section className="panel empty-state result-empty-state">
      <h2>Ready to verify</h2>
      <p>Add label artwork, enter expected application data, and run verification.</p>
      <p>One label works as a single verification. Multiple labels create a queue.</p>
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
