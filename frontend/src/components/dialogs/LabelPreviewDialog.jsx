import { useDismissibleDialog } from '../../hooks/useDismissibleDialog';
import { useObjectUrl } from '../../hooks/useObjectUrl';
// Modal preview for a queued browser File object.
import DialogPortal from './DialogPortal';

export default function LabelPreviewDialog({ item, onClose }) {
  const previewUrl = useObjectUrl(item?.file);
  const { handleOverlayMouseDown } = useDismissibleDialog(onClose);

  return (
    <DialogPortal>
      <div className="label-preview-dialog-overlay" onMouseDown={handleOverlayMouseDown}>
        <div
          aria-labelledby="label-preview-dialog-title"
          aria-modal="true"
          className="label-preview-dialog"
          role="dialog"
        >
          <div className="label-preview-dialog-header">
            <h2 id="label-preview-dialog-title">Preview: {item.filename}</h2>
          </div>

          <div className="label-preview-dialog-body">
            {previewUrl ? (
              <img
                alt={`Preview of ${item.filename}`}
                className="label-preview-image"
                src={previewUrl}
              />
            ) : (
              <p className="label-preview-empty">Preview is not available for this file.</p>
            )}
          </div>

          <div className="label-preview-dialog-footer">
            <button className="secondary-button export-dialog-back-button" type="button" onClick={onClose}>
              Back
            </button>
          </div>
        </div>
      </div>
    </DialogPortal>
  );
}
