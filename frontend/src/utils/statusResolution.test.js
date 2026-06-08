import { describe, expect, it } from 'vitest';
import {
  getAutomatedStatus,
  getQueueItemStatusClass,
  getQueueItemStatusLabel,
  getQueueStatusCounts,
  hasCurrentResult,
} from './statusResolution';

function makeQueueItem(overrides = {}) {
  return {
    id: 'label-one',
    status: 'pass',
    isResultStale: false,
    result: {
      overall_status: 'pass',
      field_results: [],
      processing_time_ms: 123,
    },
    ...overrides,
  };
}

describe('status resolution', () => {
  it('uses the current backend result when result evidence is available', () => {
    const item = makeQueueItem({ result: { overall_status: 'fail' } });

    expect(hasCurrentResult(item)).toBe(true);
    expect(getAutomatedStatus(item)).toBe('fail');
  });

  it('falls back to queue workflow status when result evidence is missing or stale', () => {
    expect(getAutomatedStatus(makeQueueItem({ result: null, status: 'ready' }))).toBe('ready');
    expect(getAutomatedStatus(makeQueueItem({ isResultStale: true, status: 'ready' }))).toBe('ready');
  });

  it('returns queue labels and classes from backend status', () => {
    const item = makeQueueItem({
      result: { overall_status: 'needs_review' },
    });

    expect(getQueueItemStatusLabel(item)).toBe('Needs Review');
    expect(getQueueItemStatusClass(item)).toBe('queue-status queue-status-needs-review');
  });

  it('counts queue summaries from backend statuses', () => {
    const summary = getQueueStatusCounts([
      makeQueueItem({ id: 'ready', result: null, status: 'ready' }),
      makeQueueItem({ id: 'pass', result: { overall_status: 'pass' }, status: 'pass' }),
      makeQueueItem({ id: 'fail', result: { overall_status: 'fail' }, status: 'fail' }),
      makeQueueItem({ id: 'review', result: { overall_status: 'needs_review' }, status: 'needs_review' }),
      makeQueueItem({ id: 'request-error', result: null, status: 'error' }),
    ]);

    expect(summary).toMatchObject({
      totalLabels: 5,
      readyLabels: 1,
      checkedCount: 4,
      passedCount: 1,
      failedCount: 3,
      passCount: 1,
      failCount: 1,
      needsReviewCount: 1,
      errorCount: 1,
    });
  });

  it('uses request error status when no result evidence exists', () => {
    const item = makeQueueItem({ result: null, status: 'error' });

    expect(hasCurrentResult(item)).toBe(false);
    expect(getAutomatedStatus(item)).toBe('error');
  });
});
