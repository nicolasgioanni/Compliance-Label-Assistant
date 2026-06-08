import { getAutomatedStatus } from './statusResolution';

export const QUEUE_FILTERS = [
  { id: 'needs_work', label: 'Needs Review' },
  { id: 'pass', label: 'Pass' },
  { id: 'fail', label: 'Fail' },
];

const DEFAULT_QUEUE_FILTER_IDS = QUEUE_FILTERS.map((filter) => filter.id);

const QUEUE_FILTER_ID_BY_STATUS = {
  needs_expected_data: 'needs_work',
  ready: 'needs_work',
  verifying: 'needs_work',
  pass: 'pass',
  fail: 'fail',
  needs_review: 'fail',
  error: 'fail',
};

export function createDefaultQueueFilterIds() {
  return new Set(DEFAULT_QUEUE_FILTER_IDS);
}

export function getQueueFilterIdForStatus(status) {
  return QUEUE_FILTER_ID_BY_STATUS[status] || 'needs_work';
}

export function filterQueueItemsByStatus(queueItems, selectedFilterIds) {
  return queueItems.filter((item) => selectedFilterIds.has(getQueueFilterIdForStatus(getAutomatedStatus(item))));
}
