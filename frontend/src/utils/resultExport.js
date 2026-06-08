import {
  getAutomatedStatus,
  hasCurrentResult,
} from './statusResolution';

export const EXPORT_FILE_BASENAME = 'label-compliance-verification-results';

export const EXPORT_COLUMNS = [
  ['filename', 'filename'],
  ['overall_status', 'overall_status'],
  ['brand_name_status', 'brand_name'],
  ['class_type_status', 'class_type'],
  ['alcohol_content_status', 'alcohol_content'],
  ['net_contents_status', 'net_contents'],
  ['government_warning_status', 'government_warning'],
  ['processing_time_ms', 'processing_time_ms'],
];

export function buildExportFilename(extension, date = new Date()) {
  return `${EXPORT_FILE_BASENAME}_${buildExportTimestamp(date)}.${extension}`;
}

export function buildExportTimestamp(date) {
  return [
    `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`,
    `${padDatePart(date.getHours())}-${padDatePart(date.getMinutes())}-${padDatePart(date.getSeconds())}`,
  ].join('_');
}

export function buildQueueExportRows(queueItems) {
  return queueItems
    .filter(hasCurrentResult)
    .map((item) => ({
      filename: item.filename,
      overall_status: getAutomatedStatus(item),
      field_results: item.result.field_results || [],
      processing_time_ms: item.result.processing_time_ms ?? '',
    }));
}

export function buildQueueResultsCsv(queueItems) {
  return buildCsvFromRows(buildQueueExportRows(queueItems));
}

export function downloadQueueResultsCsv(queueItems, filename = buildExportFilename('csv')) {
  downloadBlob(buildQueueResultsCsv(queueItems), filename, 'text/csv;charset=utf-8');
}

export async function downloadQueueResultsXlsx(queueItems, filename = buildExportFilename('xlsx')) {
  const { default: writeExcelFile } = await import('write-excel-file/browser');
  const sheetRows = buildXlsxSheetRows(buildQueueExportRows(queueItems));

  await writeExcelFile(sheetRows, { sheet: 'Verification Results' }).toFile(filename);
}

export function buildXlsxSheetRows(results) {
  return [
    EXPORT_COLUMNS.map(([columnName]) => columnName),
    ...results.map((result) => EXPORT_COLUMNS.map(([, fieldName]) => getColumnValue(result, fieldName))),
  ];
}

function buildCsvFromRows(results) {
  return buildXlsxSheetRows(results)
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
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

function padDatePart(value) {
  return String(value).padStart(2, '0');
}
