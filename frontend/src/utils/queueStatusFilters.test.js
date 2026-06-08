import { describe, expect, it } from 'vitest';
import {
  createDefaultQueueFilterIds,
  filterQueueItemsByStatus,
  getQueueFilterIdForStatus,
  QUEUE_FILTERS,
} from './queueStatusFilters';

describe('queue status filters', () => {
  it.each([
    ['needs_expected_data', 'needs_work'],
    ['ready', 'needs_work'],
    ['verifying', 'needs_work'],
    ['pass', 'pass'],
    ['fail', 'fail'],
    ['needs_review', 'fail'],
    ['error', 'fail'],
  ])('maps %s to %s', (status, expectedFilterId) => {
    expect(getQueueFilterIdForStatus(status)).toBe(expectedFilterId);
  });

  it('maps unknown statuses to Needs Review filter', () => {
    expect(getQueueFilterIdForStatus('unexpected_status')).toBe('needs_work');
  });

  it('creates a new selected filter set with every filter enabled', () => {
    const selectedFilterIds = createDefaultQueueFilterIds();

    expect(selectedFilterIds).toEqual(new Set(QUEUE_FILTERS.map((filter) => filter.id)));
    expect(createDefaultQueueFilterIds()).not.toBe(selectedFilterIds);
  });

  it('filters queue items by selected status groups in one pass', () => {
    const queueItems = [
      { id: 'needs-data', status: 'needs_expected_data' },
      { id: 'ready', status: 'ready' },
      { id: 'pass', status: 'pass', isResultStale: false, result: { overall_status: 'pass' } },
      { id: 'fail', status: 'fail', isResultStale: false, result: { overall_status: 'fail' } },
      { id: 'review', status: 'needs_review', isResultStale: false, result: { overall_status: 'needs_review' } },
      { id: 'error', status: 'error' },
    ];

    expect(filterQueueItemsByStatus(queueItems, new Set(['fail'])).map((item) => item.id)).toEqual([
      'fail',
      'review',
      'error',
    ]);
  });

  it('filters verified queue items by manual final decision when one exists', () => {
    const queueItems = [
      {
        id: 'manual-pass',
        status: 'fail',
        isResultStale: false,
        manualDecision: { status: 'pass', note: '', updatedAt: '2026-06-08T10:00:00.000Z' },
        result: { overall_status: 'fail' },
      },
      {
        id: 'manual-fail',
        status: 'pass',
        isResultStale: false,
        manualDecision: { status: 'fail', note: '', updatedAt: '2026-06-08T10:00:00.000Z' },
        result: { overall_status: 'pass' },
      },
    ];

    expect(filterQueueItemsByStatus(queueItems, new Set(['pass'])).map((item) => item.id)).toEqual(['manual-pass']);
    expect(filterQueueItemsByStatus(queueItems, new Set(['fail'])).map((item) => item.id)).toEqual(['manual-fail']);
  });

  it('returns no queue items when every filter is off', () => {
    const queueItems = [
      { id: 'needs-data', status: 'needs_expected_data' },
      { id: 'pass', status: 'pass' },
      { id: 'fail', status: 'fail' },
    ];

    expect(filterQueueItemsByStatus(queueItems, new Set())).toEqual([]);
  });
});
