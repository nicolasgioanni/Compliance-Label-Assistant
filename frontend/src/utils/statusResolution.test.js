import { describe, expect, it } from 'vitest';
import {
  canSetManualDecision,
  getAllowedManualDecisionStatuses,
  getAutomatedStatus,
  getEffectiveStatus,
  getManualDecision,
  getQueueItemStatusClass,
  getQueueItemStatusLabel,
  getQueueStatusCounts,
  hasCurrentResult,
  hasManualDecision,
} from './statusResolution';

function makeQueueItem(overrides = {}) {
  return {
    id: 'label-one',
    status: 'pass',
    isResultStale: false,
    manualDecision: null,
    result: {
      overall_status: 'pass',
      field_results: [],
      processing_time_ms: 123,
    },
    ...overrides,
  };
}

describe('status resolution', () => {
  it('uses the automated result when no manual decision exists', () => {
    const item = makeQueueItem({ result: { overall_status: 'fail' } });

    expect(hasCurrentResult(item)).toBe(true);
    expect(getAutomatedStatus(item)).toBe('fail');
    expect(getManualDecision(item)).toBeNull();
    expect(hasManualDecision(item)).toBe(false);
    expect(getEffectiveStatus(item)).toBe('fail');
  });

  it('uses the manual decision only for current verification results', () => {
    const manualDecision = {
      status: 'pass',
      note: 'Reviewer confirmed label.',
      updatedAt: '2026-06-08T10:00:00.000Z',
    };

    expect(getEffectiveStatus(makeQueueItem({ manualDecision, result: { overall_status: 'fail' } }))).toBe('pass');
    expect(getEffectiveStatus(makeQueueItem({ isResultStale: true, manualDecision, status: 'ready' }))).toBe('ready');
  });

  it('returns queue labels and classes from the effective status', () => {
    const item = makeQueueItem({
      manualDecision: { status: 'needs_review', note: '', updatedAt: '2026-06-08T10:00:00.000Z' },
      result: { overall_status: 'pass' },
    });

    expect(getQueueItemStatusLabel(item)).toBe('Needs Review');
    expect(getQueueItemStatusClass(item)).toBe('queue-status queue-status-needs-review');
  });

  it('counts queue summaries from effective statuses and tracks manual decisions', () => {
    const summary = getQueueStatusCounts([
      makeQueueItem({ id: 'ready', result: null, status: 'ready' }),
      makeQueueItem({ id: 'automated-pass', result: { overall_status: 'pass' }, status: 'pass' }),
      makeQueueItem({
        id: 'manual-pass',
        manualDecision: { status: 'pass', note: '', updatedAt: '2026-06-08T10:00:00.000Z' },
        result: { overall_status: 'fail' },
        status: 'fail',
      }),
      makeQueueItem({ id: 'review', result: { overall_status: 'needs_review' }, status: 'needs_review' }),
      makeQueueItem({ id: 'request-error', result: null, status: 'error' }),
    ]);

    expect(summary).toMatchObject({
      totalLabels: 5,
      readyLabels: 1,
      checkedCount: 4,
      passedCount: 2,
      failedCount: 2,
      passCount: 2,
      needsReviewCount: 1,
      errorCount: 1,
      manualDecisionCount: 1,
    });
  });

  it('disallows pass for automated error results', () => {
    const item = makeQueueItem({ result: { overall_status: 'error' }, status: 'error' });

    expect(canSetManualDecision(item)).toBe(true);
    expect(getAllowedManualDecisionStatuses(item)).toEqual(['fail', 'needs_review']);
  });

  it('does not allow manual decisions for request errors without result evidence', () => {
    const item = makeQueueItem({ result: null, status: 'error' });

    expect(hasCurrentResult(item)).toBe(false);
    expect(canSetManualDecision(item)).toBe(false);
    expect(getEffectiveStatus(item)).toBe('error');
  });
});
