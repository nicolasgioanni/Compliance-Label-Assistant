import { useState } from 'react';
import { useDismissibleDialog } from '../../hooks/useDismissibleDialog';
import InfoTooltip from '../shared/InfoTooltip';

const EXPORT_FORMATS = [
  { id: 'xlsx', label: 'Excel workbook (.xlsx)' },
  { id: 'csv', label: 'CSV file (.csv)' },
];

const XLSX_EXPORT_ERROR_MESSAGE = 'Excel export could not be completed. Try CSV export or try again.';

export default function ExportResultsDialog({ onClose, onDownloadCsv, onDownloadError = () => {}, onDownloadXlsx }) {
  const [selectedFormat, setSelectedFormat] = useState('xlsx');
  const { handleOverlayMouseDown } = useDismissibleDialog(onClose);

  function handleDownload() {
    if (selectedFormat === 'csv') {
      onDownloadCsv();
      onClose();
      return;
    }

    try {
      Promise.resolve(onDownloadXlsx()).catch(() => {
        onDownloadError(XLSX_EXPORT_ERROR_MESSAGE);
      });
    } catch {
      onDownloadError(XLSX_EXPORT_ERROR_MESSAGE);
    }
    onClose();
  }

  return (
    <div className="export-dialog-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        aria-labelledby="export-dialog-title"
        aria-modal="true"
        className="export-dialog"
        role="dialog"
      >
        <div className="export-dialog-title-row">
          <h2 id="export-dialog-title">Which file type would you like to download?</h2>
          <InfoTooltip label="About exported results">
            <span className="export-dialog-tooltip-copy">
              <span>Export Results downloads one results file for labels that have a current verification result.</span>
              <span>
                It includes the filename, overall status, field statuses, and processing time.
              </span>
              <span>
                Labels without a current result are not included. Stale results are not included until you verify that
                label again.
              </span>
              <span>
                Choose Excel workbook (.xlsx) for a spreadsheet file with a Verification Results sheet. Choose CSV file
                (.csv) for a simple table file that works with spreadsheets and other tools.
              </span>
              <span>
                The file name starts with label-compliance-verification-results and adds the current date and time before
                the .xlsx or .csv ending.
              </span>
            </span>
          </InfoTooltip>
        </div>
        <fieldset className="export-format-list">
          <legend className="sr-only">Export file type</legend>
          {EXPORT_FORMATS.map((format) => (
            <label
              className={
                selectedFormat === format.id
                  ? 'export-format-option export-format-option-selected'
                  : 'export-format-option'
              }
              key={format.id}
            >
              <input
                checked={selectedFormat === format.id}
                name="export-format"
                type="radio"
                value={format.id}
                onChange={() => setSelectedFormat(format.id)}
              />
              <span>{format.label}</span>
            </label>
          ))}
        </fieldset>
        <div className="export-dialog-footer">
          <button className="secondary-button export-dialog-back-button" type="button" onClick={onClose}>
            Back
          </button>
          <button className="primary-button" type="button" onClick={handleDownload}>
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
