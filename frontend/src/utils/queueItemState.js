// Pure queue-item state transitions shared by hooks and tests.
import { createEmptyExpectedFields } from './expectedFields';
import {
  clearCopiedExpectedFields,
  copyExpectedFields,
  hasDifferentCopyExpectedFields,
} from './expectedFieldCopy';
import { validateExpectedFields } from './expectedFields';
import { hasCurrentResult } from './statusResolution';

const EMPTY_EXPECTED_FIELDS = createEmptyExpectedFields();

export function createQueueItem(file, id = createClientId()) {
  const relativePath = getFileRelativePath(file);

  // Queue items keep browser File objects in memory until verification; the
  // app does not persist uploads or create server-side records.
  return {
    id,
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

export function applyExpectedFieldsChange(item, nextExpectedFields) {
  // Expected-field edits invalidate current evidence without deleting the old
  // result, allowing the UI to explain stale data to the reviewer.
  return {
    ...item,
    expectedFields: nextExpectedFields,
    errorMessage: null,
    isResultStale: item.result ? true : item.isResultStale,
    status: getQueueStatusForExpectedFields(nextExpectedFields),
    workspaceView: 'form',
  };
}

export function applyVerificationStarted(item) {
  return {
    ...item,
    errorMessage: null,
    isResultStale: item.result ? true : item.isResultStale,
    status: 'verifying',
  };
}

export function applyVerificationSuccess(item, result) {
  return {
    ...item,
    errorMessage: null,
    isResultStale: false,
    result,
    status: result.overall_status,
    workspaceView: 'result',
  };
}

export function applyVerificationError(item, errorMessage) {
  return {
    ...item,
    errorMessage,
    isResultStale: item.result ? true : item.isResultStale,
    status: 'error',
    workspaceView: 'error',
  };
}

export function showResultView(item) {
  return hasCurrentResult(item) ? { ...item, workspaceView: 'result' } : item;
}

export function showFormView(item) {
  return {
    ...item,
    workspaceView: 'form',
  };
}

export function copyExpectedFieldsToQueueItem(item, sourceExpectedFields) {
  // Copying changed expected data clears prior verification evidence because it
  // was produced against a different target field set.
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

export function clearExpectedFieldsFromQueueItem(item) {
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

export function getQueueStatusForExpectedFields(expectedFields) {
  return validateExpectedFields(expectedFields) ? 'needs_expected_data' : 'ready';
}

function getFileRelativePath(file) {
  return typeof file.webkitRelativePath === 'string' ? file.webkitRelativePath : '';
}

function createClientId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
