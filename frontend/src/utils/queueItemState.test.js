import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_GOVERNMENT_WARNING } from '../constants/defaultWarningText';
import {
  applyExpectedFieldsChange,
  applyVerificationError,
  applyVerificationStarted,
  applyVerificationSuccess,
  clearExpectedFieldsFromQueueItem,
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
      status: 'needs_expected_data',
      workspaceView: 'form',
    });
    expect(item.expectedFields.brandName).toBe('');
    expect(item.expectedFields.governmentWarning).toBe(DEFAULT_GOVERNMENT_WARNING);
  });

  it('marks current results stale when expected fields change', () => {
    const item = makeQueueItem({
      errorMessage: 'Old error.',
      result: makeResult(),
      status: 'pass',
      workspaceView: 'result',
    });
    const nextExpectedFields = { ...item.expectedFields, brandName: 'Changed Brand' };

    expect(applyExpectedFieldsChange(item, nextExpectedFields)).toMatchObject({
      expectedFields: nextExpectedFields,
      errorMessage: null,
      isResultStale: true,
      status: 'ready',
      workspaceView: 'form',
    });
  });

  it('marks existing evidence stale when verification starts', () => {
    const item = makeQueueItem({
      result: makeResult(),
      status: 'fail',
    });

    expect(applyVerificationStarted(item)).toMatchObject({
      errorMessage: null,
      isResultStale: true,
      status: 'verifying',
    });
  });

  it('stores backend evidence unchanged on verification success', () => {
    const result = makeResult({ overall_status: 'fail' });
    const item = makeQueueItem({
      errorMessage: 'Old error.',
      isResultStale: true,
      status: 'verifying',
    });

    expect(applyVerificationSuccess(item, result)).toMatchObject({
      errorMessage: null,
      isResultStale: false,
      result,
      status: 'fail',
      workspaceView: 'result',
    });
  });

  it('keeps old evidence but marks it stale on verification error', () => {
    const result = makeResult();
    const item = makeQueueItem({
      result,
      status: 'verifying',
      workspaceView: 'result',
    });

    expect(applyVerificationError(item, 'Request failed.')).toMatchObject({
      errorMessage: 'Request failed.',
      isResultStale: true,
      result,
      status: 'error',
      workspaceView: 'error',
    });
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
      status: 'pass',
    });

    const clearedItem = clearExpectedFieldsFromQueueItem(item);

    expect(clearedItem).toMatchObject({
      errorMessage: null,
      isResultStale: false,
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
