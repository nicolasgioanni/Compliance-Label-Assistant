import { useState } from 'react';

export default function ImageUploadDropzone({ disabled, maxQueueSize, onFilesAdded }) {
  const [isDragActive, setIsDragActive] = useState(false);

  function handleFileChange(event) {
    const nextFiles = Array.from(event.target.files || []);
    if (nextFiles.length) {
      onFilesAdded(nextFiles);
    }
    event.target.value = '';
  }

  function handleDragOver(event) {
    event.preventDefault();

    if (disabled) {
      event.dataTransfer.dropEffect = 'none';
      return;
    }

    event.dataTransfer.dropEffect = 'copy';
    setIsDragActive(true);
  }

  function handleDragLeave() {
    setIsDragActive(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragActive(false);

    if (disabled) {
      return;
    }

    const droppedFiles = Array.from(event.dataTransfer.files || []);
    if (droppedFiles.length) {
      onFilesAdded(droppedFiles);
    }
  }

  const dropzoneClassName = disabled ? 'dropzone disabled' : `dropzone${isDragActive ? ' drag-active' : ''}`;

  return (
    <div className="upload-control">
      <label
        className={dropzoneClassName}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          disabled={disabled}
          multiple
          type="file"
          onChange={handleFileChange}
        />
        <span className="dropzone-copy">
          <span aria-hidden="true" className="dropzone-icon">
            <svg viewBox="0 0 32 32" focusable="false">
              <path d="M8 6h10l6 6v14H8z" />
              <path d="M18 6v7h6" />
              <path d="M16 23V13" />
              <path d="M12 17l4-4 4 4" />
            </svg>
          </span>
          <span className="dropzone-title">Drop a label image here</span>
          <span className="dropzone-subtitle">
            or click to browse &bull; PNG or JPG only &bull; Maximum {maxQueueSize} files
          </span>
        </span>
      </label>
    </div>
  );
}
