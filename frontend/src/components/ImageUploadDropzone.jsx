import { validateBatchFiles, validateSingleFile } from '../utils/fileValidation';

export default function ImageUploadDropzone({ mode, selectedFiles, onFilesChange }) {
  const validationMessage = selectedFiles.length
    ? mode === 'batch'
      ? validateBatchFiles(selectedFiles)
      : validateSingleFile(selectedFiles[0])
    : '';
  const selectedFileLabel = getSelectedFileLabel(selectedFiles, mode);

  function handleFileChange(event) {
    const nextFiles = Array.from(event.target.files || []);
    onFilesChange(mode === 'batch' ? nextFiles : nextFiles.slice(0, 1));
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Label Image</h2>
      </div>
      <label className="dropzone">
        <input
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          multiple={mode === 'batch'}
          onChange={handleFileChange}
        />
        <span>{selectedFileLabel}</span>
      </label>
      {validationMessage ? <p className="field-warning">{validationMessage}</p> : null}
    </section>
  );
}

function getSelectedFileLabel(selectedFiles, mode) {
  if (!selectedFiles.length) {
    return mode === 'batch' ? 'Choose 2 to 10 JPG or PNG label images' : 'Choose a JPG or PNG label image';
  }

  if (mode === 'batch') {
    return `${selectedFiles.length} label images selected`;
  }

  return selectedFiles[0].name;
}
