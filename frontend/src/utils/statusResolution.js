import { getStatusLabel } from './statusStyles';

const QUEUE_STATUS_LABELS = {
  needs_expected_data: 'Needs Expected Data',
  ready: 'Ready',
  verifying: 'Verifying',
  pass: 'Pass',
  fail: 'Fail',
  needs_review: 'Needs Review',
  error: 'Error',
};

const DEFAULT_QUEUE_SUMMARY = {
  totalLabels: 0,
  readyLabels: 0,
  checkedCount: 0,
  passedCount: 0,
  failedCount: 0,
  verifiedLabels: 0,
  passCount: 0,
  failCount: 0,
  needsReviewCount: 0,
  errorCount: 0,
};

export function hasCurrentResult(queueItem) {
  return Boolean(queueItem?.result && !queueItem.isResultStale);
}

export function getAutomatedStatus(queueItem) {
  if (hasCurrentResult(queueItem)) {
    return queueItem.result.overall_status || 'needs_review';
  }

  return queueItem?.status || 'needs_expected_data';
}

export function getQueueStatusCounts(queueItems) {
  return queueItems.reduce((summary, item) => {
    summary.totalLabels += 1;

    if (item.status === 'ready') {
      summary.readyLabels += 1;
    }

    if (hasCurrentResult(item)) {
      summary.checkedCount += 1;
      summary.verifiedLabels += 1;
      applyStatusCount(summary, getAutomatedStatus(item));
      return summary;
    }

    if (item.status === 'error') {
      summary.checkedCount += 1;
      summary.failedCount += 1;
      summary.errorCount += 1;
    }

    return summary;
  }, { ...DEFAULT_QUEUE_SUMMARY });
}

export function getQueueItemStatusLabel(queueItem) {
  const status = getAutomatedStatus(queueItem);
  return QUEUE_STATUS_LABELS[status] || getStatusLabel(status);
}

export function getQueueItemStatusClass(queueItem) {
  return `queue-status queue-status-${formatStatusClassSuffix(getAutomatedStatus(queueItem))}`;
}

function applyStatusCount(summary, status) {
  if (status === 'pass') {
    summary.passedCount += 1;
    summary.passCount += 1;
    return;
  }

  summary.failedCount += 1;

  if (status === 'fail') {
    summary.failCount += 1;
  } else if (status === 'needs_review') {
    summary.needsReviewCount += 1;
  } else if (status === 'error') {
    summary.errorCount += 1;
  }
}

function formatStatusClassSuffix(status) {
  return status?.replaceAll('_', '-') || 'needs-expected-data';
}
