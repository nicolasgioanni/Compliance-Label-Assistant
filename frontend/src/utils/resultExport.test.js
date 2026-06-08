import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildExportFilename,
  buildExportTimestamp,
  buildQueueExportRows,
  buildQueueResultsCsv,
  buildXlsxSheetRows,
  downloadQueueResultsCsv,
  downloadQueueResultsXlsx,
} from './resultExport';

const { toFileMock, writeExcelFileMock } = vi.hoisted(() => ({
  toFileMock: vi.fn(),
  writeExcelFileMock: vi.fn(),
}));

vi.mock('write-excel-file/browser', () => ({
  default: writeExcelFileMock,
}));

const FIXED_EXPORT_DATE = new Date(2026, 5, 7, 19, 24, 8);
const EXPECTED_CSV_FILENAME = 'label-compliance-verification-results_2026-06-07_19-24-08.csv';
const EXPECTED_XLSX_FILENAME = 'label-compliance-verification-results_2026-06-07_19-24-08.xlsx';

function makeQueueItem(overrides = {}) {
  return {
    filename: 'label-one.png',
    isResultStale: false,
    result: {
      overall_status: 'pass',
      processing_time_ms: 123,
      field_results: [
        { field_name: 'brand_name', status: 'pass' },
        { field_name: 'class_type', status: 'fail' },
        { field_name: 'alcohol_content', status: 'needs_review' },
        { field_name: 'net_contents', status: 'missing' },
        { field_name: 'government_warning', status: 'pass' },
      ],
    },
    ...overrides,
  };
}

describe('result export utilities', () => {
  let originalCreateObjectURL;
  let originalRevokeObjectURL;
  let clickedDownloadFilename;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_EXPORT_DATE);
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;
    clickedDownloadFilename = '';
    writeExcelFileMock.mockReturnValue({ toFile: toFileMock });
    toFileMock.mockResolvedValue(undefined);

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:result-export'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function clickDownloadLink() {
      clickedDownloadFilename = this.download;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();

    if (originalCreateObjectURL) {
      Object.defineProperty(URL, 'createObjectURL', {
        configurable: true,
        value: originalCreateObjectURL,
      });
    } else {
      delete URL.createObjectURL;
    }

    if (originalRevokeObjectURL) {
      Object.defineProperty(URL, 'revokeObjectURL', {
        configurable: true,
        value: originalRevokeObjectURL,
      });
    } else {
      delete URL.revokeObjectURL;
    }
  });

  it('builds CSV content from current verification result data and skips stale or unverified items', () => {
    const csv = buildQueueResultsCsv([
      makeQueueItem(),
      makeQueueItem({ filename: 'stale-label.png', isResultStale: true }),
      { filename: 'unverified-label.png', isResultStale: false, result: null },
    ]);

    expect(csv).toBe(
      [
        'filename,overall_status,brand_name_status,class_type_status,alcohol_content_status,net_contents_status,government_warning_status,processing_time_ms',
        'label-one.png,pass,pass,fail,needs_review,missing,pass,123',
      ].join('\n'),
    );
  });

  it('downloads CSV with the shared formal filename', () => {
    downloadQueueResultsCsv([makeQueueItem()]);

    expect(clickedDownloadFilename).toBe(EXPECTED_CSV_FILENAME);
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:result-export');
  });

  it('downloads XLSX with the shared formal filename and the expected verification rows', async () => {
    await downloadQueueResultsXlsx([makeQueueItem()]);

    expect(writeExcelFileMock).toHaveBeenCalledWith(
      [
        [
          'filename',
          'overall_status',
          'brand_name_status',
          'class_type_status',
          'alcohol_content_status',
          'net_contents_status',
          'government_warning_status',
          'processing_time_ms',
        ],
        ['label-one.png', 'pass', 'pass', 'fail', 'needs_review', 'missing', 'pass', 123],
      ],
      { sheet: 'Verification Results' },
    );
    expect(toFileMock).toHaveBeenCalledWith(EXPECTED_XLSX_FILENAME);
  });

  it('builds sortable timestamped export filenames from local time', () => {
    expect(buildExportFilename('csv', FIXED_EXPORT_DATE)).toBe(EXPECTED_CSV_FILENAME);
    expect(buildExportFilename('xlsx', FIXED_EXPORT_DATE)).toBe(EXPECTED_XLSX_FILENAME);
  });

  it('zero-pads timestamp date and time parts', () => {
    expect(buildExportTimestamp(new Date(2026, 0, 2, 3, 4, 5))).toBe('2026-01-02_03-04-05');
  });

  it('uses the same rows for CSV and XLSX exports', () => {
    const rows = buildQueueExportRows([makeQueueItem()]);

    expect(buildXlsxSheetRows(rows)).toEqual([
      [
        'filename',
        'overall_status',
        'brand_name_status',
        'class_type_status',
        'alcohol_content_status',
        'net_contents_status',
        'government_warning_status',
        'processing_time_ms',
      ],
      ['label-one.png', 'pass', 'pass', 'fail', 'needs_review', 'missing', 'pass', 123],
    ]);
  });
});
