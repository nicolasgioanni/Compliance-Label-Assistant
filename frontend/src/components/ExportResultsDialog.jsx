import { useEffect } from 'react';

export default function ExportResultsDialog({ onClose, onDownloadCsv, onDownloadXlsx }) {
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

  function handleCsvDownload() {
    onDownloadCsv();
    onClose();
  }

  function handleXlsxDownload() {
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
        <div className="export-dialog-actions">
          <button className="primary-button" type="button" onClick={handleCsvDownload}>
            Download CSV
          </button>
          <button className="primary-button" type="button" onClick={handleXlsxDownload}>
            Download Excel
          </button>
          <button className="secondary-button" type="button" onClick={onClose}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
