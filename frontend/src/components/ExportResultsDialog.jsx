import { useEffect, useState } from 'react';

const EXPORT_FORMATS = [
  { id: 'xlsx', label: 'Excel workbook (.xlsx)' },
  { id: 'csv', label: 'CSV file (.csv)' },
];

export default function ExportResultsDialog({ onClose, onDownloadCsv, onDownloadXlsx }) {
  const [selectedFormat, setSelectedFormat] = useState('xlsx');

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleOverlayMouseDown(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleDownload() {
    if (selectedFormat === 'csv') {
      onDownloadCsv();
      onClose();
      return;
    }

    Promise.resolve(onDownloadXlsx()).catch((error) => {
      console.error('Excel export failed.', error);
    });
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
        <h2 id="export-dialog-title">Which file type would you like to download?</h2>
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
