import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_GOVERNMENT_WARNING } from '../constants/defaultWarningText';
import {
  applyExpectedFieldsChange,
  applyManualDecision,
  applyVerificationError,
  applyVerificationStarted,
  applyVerificationSuccess,
  clearExpectedFieldsFromQueueItem,
  clearManualDecision,
  copyExpectedFieldsToQueueItem,
  createQueueItem,
  showFormView,
  showResultView,
} from './queueItemState';

function makeFile(name = 'label.png') {
  return new File([new Uint8Array(4)], name, { type: 'image/png' });
}

function makeQueueItem(overrides = {}) {
  return {
    id: 'item-one',
    file: makeFile(),
    filename: 'label.png',
    relativePath: '',
    expectedFields: {
      brandName: 'Original Brand',
      classType: 'Whiskey',
      alcoholContent: '',
      netContents: '',
      bottlerProducer: '',
      countryOfOrigin: '',
      governmentWarning: DEFAULT_GOVERNMENT_WARNING,
    },
    result: null,
    isResultStale: false,
    manualDecision: null,
    status: 'ready',
    errorMessage: null,
    workspaceView: 'form',
    ...overrides,
  };
}

function makeResult(overrides = {}) {
  return {
    overall_status: 'pass',
    field_results: [],
    extracted_fields: {},
    processing_time_ms: 42,
    ...overrides,
  };
}

describe('queue item state transitions', () => {
  it('creates queue items with upload metadata and empty expected fields', () => {
    const file = makeFile('new-label.png');
    Object.defineProperty(file, 'webkitRelativePath', {
      configurable: true,
      value: 'labels/new-label.png',
    });

    const item = createQueueItem(file, 'fixed-id');

    expect(item).toMatchObject({
      id: 'fixed-id',
      file,
      filename: 'new-label.png',
      relativePath: 'labels/new-label.png',
      result: null,
      isResultStale: false,
      manualDecision: null,
      status: 'needs_expected_data',
      workspaceView: 'form',
    });
    expect(item.expectedFields.brandName).toBe('');
    expect(item.expectedFields.governmentWarning).toBe(DEFAULT_GOVERNMENT_WARNING);
  });

  it('marks current results stale when expected fields change', () => {
    const item = makeQueueItem({
      errorMessage: 'Old error.',
      manualDecision: { status: 'pass', note: '', updatedAt: '2026-06-08T10:00:00.000Z' },
      result: makeResult(),
      status: 'pass',
      workspaceView: 'result',
    });
    const nextExpectedFields = { ...item.expectedFields, brandName: 'Changed Brand' };

    expect(applyExpectedFieldsChange(item, nextExpectedFields)).toMatchObject({
      expectedFields: nextExpectedFields,
      errorMessage: null,
      isResultStale: true,
      manualDecision: null,
      status: 'ready',
      workspaceView: 'form',
    });
  });

  it('clears manual decisions and marks existing evidence stale when verification starts', () => {
    const item = makeQueueItem({
      manualDecision: { status: 'pass', note: '', updatedAt: '2026-06-08T10:00:00.000Z' },
      result: makeResult(),
      status: 'fail',
    });

    expect(applyVerificationStarted(item)).toMatchObject({
      errorMessage: null,
      isResultStale: true,
      manualDecision: null,
      status: 'verifying',
    });
  });

  it('stores backend evidence unchanged on verification success', () => {
    const result = makeResult({ overall_status: 'fail' });
    const item = makeQueueItem({
      errorMessage: 'Old error.',
      isResultStale: true,
      manualDecision: { status: 'pass', note: '', updatedAt: '2026-06-08T10:00:00.000Z' },
      status: 'verifying',
    });

    expect(applyVerificationSuccess(item, result)).toMatchObject({
      errorMessage: null,
      isResultStale: false,
      manualDecision: null,
      result,
      status: 'fail',
      workspaceView: 'result',
    });
  });

  it('keeps old evidence but marks it stale on verification error', () => {
    const result = makeResult();
    const item = makeQueueItem({
      manualDecision: { status: 'pass', note: '', updatedAt: '2026-06-08T10:00:00.000Z' },
      result,
      status: 'verifying',
      workspaceView: 'result',
    });

    expect(applyVerificationError(item, 'Request failed.')).toMatchObject({
      errorMessage: 'Request failed.',
      isResultStale: true,
      manualDecision: null,
      result,
      status: 'error',
      workspaceView: 'error',
    });
  });

  it('applies and clears manual decisions without touching automated evidence', () => {
    const result = makeResult({ overall_status: 'fail' });
    const item = makeQueueItem({ result, status: 'fail' });
    const manualDecision = {
      status: 'pass',
      note: 'Reviewer checked label.',
      updatedAt: '2026-06-08T10:00:00.000Z',
    };

    const withManualDecision = applyManualDecision(item, manualDecision);

    expect(withManualDecision).toMatchObject({ manualDecision, result, status: 'fail' });
    expect(clearManualDecision(withManualDecision)).toMatchObject({ manualDecision: null, result, status: 'fail' });
  });

  it('switches between form and result views without mutating data', () => {
    const result = makeResult();
    const item = makeQueueItem({ result, status: 'pass', workspaceView: 'form' });

    expect(showResultView(item)).toMatchObject({ result, workspaceView: 'result' });
    expect(showFormView(item)).toMatchObject({ result, workspaceView: 'form' });
    expect(showResultView({ ...item, isResultStale: true })).toMatchObject({ workspaceView: 'form' });
  });

  it('copies expected fields and clears stale verification evidence for changed targets', () => {
    const item = makeQueueItem({
      result: makeResult(),
      status: 'pass',
      workspaceView: 'result',
    });
    const sourceExpectedFields = { ...item.expectedFields, brandName: 'Source Brand' };

    expect(copyExpectedFieldsToQueueItem(item, sourceExpectedFields)).toMatchObject({
      expectedFields: sourceExpectedFields,
      errorMessage: null,
      isResultStale: false,
      manualDecision: null,
      result: null,
      status: 'ready',
      workspaceView: 'form',
    });
  });

  it('returns the same queue item when copied expected fields are unchanged', () => {
    const item = makeQueueItem();

    expect(copyExpectedFieldsToQueueItem(item, item.expectedFields)).toBe(item);
  });

  it('clears copied expected fields and previous result state', () => {
    const item = makeQueueItem({
      result: makeResult(),
      manualDecision: { status: 'pass', note: '', updatedAt: '2026-06-08T10:00:00.000Z' },
      status: 'pass',
    });

    const clearedItem = clearExpectedFieldsFromQueueItem(item);

    expect(clearedItem).toMatchObject({
      errorMessage: null,
      isResultStale: false,
      manualDecision: null,
      result: null,
      status: 'needs_expected_data',
      workspaceView: 'form',
    });
    expect(clearedItem.expectedFields.brandName).toBe('');
    expect(clearedItem.expectedFields.governmentWarning).toBe(DEFAULT_GOVERNMENT_WARNING);
  });

  it('uses a generated id when none is provided', () => {
    const randomUUID = vi.spyOn(crypto, 'randomUUID').mockReturnValue('generated-id');

    expect(createQueueItem(makeFile()).id).toBe('generated-id');

    randomUUID.mockRestore();
  });
});
