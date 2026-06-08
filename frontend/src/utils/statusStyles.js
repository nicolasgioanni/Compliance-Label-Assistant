const STATUS_LABELS = {
  pass: 'Pass',
  normalized_match: 'Possible Match',
  fail: 'Fail',
  missing: 'Missing',
  needs_review: 'Needs Review',
  error: 'Error',
};

export function getStatusLabel(status) {
  return STATUS_LABELS[status] || 'Needs Review';
}

export function getStatusClassName(status) {
  return `status-pill status-${status?.replaceAll('_', '-') || 'needs-review'}`;
}

export function getStatusTextClassName(status) {
  return `status-text status-text-${status?.replaceAll('_', '-') || 'needs-review'}`;
}
