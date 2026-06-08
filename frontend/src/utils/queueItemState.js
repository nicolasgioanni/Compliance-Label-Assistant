import { createEmptyExpectedFields } from './expectedFields';
import {
  clearCopiedExpectedFields,
  copyExpectedFields,
  hasDifferentCopyExpectedFields,
} from './expectedFieldCopy';
import { validateExpectedFields } from './fileValidation';
import { hasCurrentResult } from './statusResolution';

const EMPTY_EXPECTED_FIELDS = createEmptyExpectedFields();

export function createQueueItem(file, id = createClientId()) {
  const relativePath = getFileRelativePath(file);

  return {
    id,
    file,
    filename: file.name,
    relativePath,
    expectedFields: { ...EMPTY_EXPECTED_FIELDS },
    result: null,
    isResultStale: false,
    manualDecision: null,
    status: 'needs_expected_data',
    errorMessage: null,
    workspaceView: 'form',
  };
}

export function applyExpectedFieldsChange(item, nextExpectedFields) {
  return {
    ...item,
    expectedFields: nextExpectedFields,
    errorMessage: null,
    isResultStale: item.result ? true : item.isResultStale,
    manualDecision: null,
    status: getQueueStatusForExpectedFields(nextExpectedFields),
    workspaceView: 'form',
  };
}

export function applyVerificationStarted(item) {
  return {
    ...item,
    errorMessage: null,
    isResultStale: item.result ? true : item.isResultStale,
    manualDecision: null,
    status: 'verifying',
  };
}

export function applyVerificationSuccess(item, result) {
  return {
    ...item,
    errorMessage: null,
    isResultStale: false,
    manualDecision: null,
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
    manualDecision: null,
    status: 'error',
    workspaceView: 'error',
  };
}

export function applyManualDecision(item, manualDecision) {
  return {
    ...item,
    manualDecision,
  };
}

export function clearManualDecision(item) {
  return {
    ...item,
    manualDecision: null,
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
  if (!hasDifferentCopyExpectedFields(item.expectedFields, sourceExpectedFields)) {
    return item;
  }

  const nextExpectedFields = copyExpectedFields(item.expectedFields, sourceExpectedFields);

  return {
    ...item,
    expectedFields: nextExpectedFields,
    errorMessage: null,
    isResultStale: false,
    manualDecision: null,
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
    manualDecision: null,
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
