import { useRef } from 'react';
import { supportsDirectoryUpload } from '../../utils/browserSupport';
import { FILE_INPUT_ACCEPT, SUPPORTED_IMAGE_DESCRIPTION } from '../../utils/fileValidation';

export default function ImageUploadDropzone({
  disabled,
  isFolderUploadSupported = supportsDirectoryUpload(),
  maxQueueSize,
  onFilesAdded,
}) {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const inputDisabled = disabled;
  const folderInputDisabled = inputDisabled || !isFolderUploadSupported;
  const folderUploadUnsupportedMessage = 'Folder upload is not supported in this browser. Use Add Files instead.';

  function handleFileChange(event) {
    const nextFiles = Array.from(event.target.files || []);
    if (nextFiles.length) {
      onFilesAdded(nextFiles);
    }
    event.target.value = '';
  }

  function handleAddFilesClick() {
    fileInputRef.current?.click();
  }

  function handleAddFolderClick() {
    folderInputRef.current?.click();
  }

  return (
    <div className="upload-control">
      <div className="upload-actions">
        <button
          className="upload-action-button"
          disabled={inputDisabled}
          type="button"
          onClick={handleAddFilesClick}
        >
          <span aria-hidden="true" className="upload-action-icon">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M7 3h7l5 5v13H7z" />
              <path d="M14 3v6h5" />
              <path d="M10 14h6" />
              <path d="M10 17h4" />
            </svg>
          </span>
          <span>Add Files</span>
        </button>
        <button
          className="upload-action-button"
          aria-describedby={!isFolderUploadSupported ? 'folder-upload-support-note' : undefined}
          aria-label={!isFolderUploadSupported ? 'Add Folder unavailable' : undefined}
          disabled={folderInputDisabled}
          title={!isFolderUploadSupported ? folderUploadUnsupportedMessage : undefined}
          type="button"
          onClick={handleAddFolderClick}
        >
          <span aria-hidden="true" className="upload-action-icon">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M3 6h7l2 3h9v12H3z" />
              <path d="M3 6v15" />
              <path d="M3 9h18" />
            </svg>
          </span>
          <span>Add Folder</span>
        </button>
      </div>
      {!isFolderUploadSupported ? (
        <p className="sr-only" id="folder-upload-support-note">
          {folderUploadUnsupportedMessage}
        </p>
      ) : null}
      <input
        accept={FILE_INPUT_ACCEPT}
        className="upload-hidden-input"
        disabled={inputDisabled}
        multiple
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
      />
      <input
        accept={FILE_INPUT_ACCEPT}
        className="upload-hidden-input"
        directory=""
        disabled={folderInputDisabled}
        multiple
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        onChange={handleFileChange}
      />
      <p className="upload-helper">
        {SUPPORTED_IMAGE_DESCRIPTION} only &bull; Maximum {maxQueueSize} labels
      </p>
    </div>
  );
}
