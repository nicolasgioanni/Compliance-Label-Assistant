import { useRef, useState } from 'react';
import { verifySingleLabel } from '../api/verificationApi';
import { validateExpectedFields } from '../utils/fileValidation';
import {
  applyVerificationError,
  applyVerificationStarted,
  applyVerificationSuccess,
} from '../utils/queueItemState';

const VERIFY_ALL_CONCURRENCY = 1;

export function useQueueVerification({
  activeQueueItems,
  selectedItem,
  showError = () => {},
  updateQueueItem,
  updateQueueItemsById,
}) {
  const [isVerifyingAll, setIsVerifyingAll] = useState(false);
  const verificationInFlightRef = useRef(false);
  const isAnyItemVerifying = activeQueueItems.some((item) => item.status === 'verifying');

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
      updateQueueItem(itemSnapshot.id, (item) => applyVerificationSuccess(item, result));
    } catch (error) {
      const errorMessage = getVerificationErrorMessage(error);
      updateQueueItem(itemSnapshot.id, (item) => applyVerificationError(item, errorMessage));
    }
  }

  function markQueueItemsVerifying(itemIds) {
    updateQueueItemsById(itemIds, applyVerificationStarted);
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

  function isVerificationBlocked() {
    return isAnyItemVerifying || isVerifyingAll || verificationInFlightRef.current;
  }

  return {
    handleVerifyReadyLabels,
    handleVerifySelected,
    isAnyItemVerifying,
    isVerificationBlocked,
    isVerifyingAll,
  };
}

function getVerificationErrorMessage(error) {
  if (error.message === 'Failed to fetch') {
    return 'The verification service is currently unavailable. Please try again shortly.';
  }

  return error.message || 'The verification request could not be completed.';
}
