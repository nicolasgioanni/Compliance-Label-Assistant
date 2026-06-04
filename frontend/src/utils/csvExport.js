const CSV_COLUMNS = [
  ['filename', 'filename'],
  ['overall_status', 'overall_status'],
  ['brand_name_status', 'brand_name'],
  ['class_type_status', 'class_type'],
  ['alcohol_content_status', 'alcohol_content'],
  ['net_contents_status', 'net_contents'],
  ['government_warning_status', 'government_warning'],
  ['processing_time_ms', 'processing_time_ms'],
];

export function buildBatchResultsCsv(batchResult) {
  const headerRow = CSV_COLUMNS.map(([columnName]) => escapeCsvValue(columnName)).join(',');
  const resultRows = (batchResult?.results || []).map((result) =>
    CSV_COLUMNS.map(([, fieldName]) => escapeCsvValue(getColumnValue(result, fieldName))).join(','),
  );

  return [headerRow, ...resultRows].join('\n');
}

export function downloadBatchResultsCsv(batchResult, filename = 'batch-verification-results.csv') {
  const csvContent = buildBatchResultsCsv(batchResult);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function getColumnValue(result, fieldName) {
  if (fieldName === 'filename') {
    return result.filename;
  }

  if (fieldName === 'overall_status') {
    return result.overall_status;
  }

  if (fieldName === 'processing_time_ms') {
    return result.processing_time_ms;
  }

  return getFieldStatus(result, fieldName);
}

function getFieldStatus(result, fieldName) {
  if (result.overall_status === 'error') {
    return 'error';
  }

  return result.field_results?.find((fieldResult) => fieldResult.field_name === fieldName)?.status || '';
}

function escapeCsvValue(value) {
  const stringValue = value === null || value === undefined ? '' : String(value);

  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}
