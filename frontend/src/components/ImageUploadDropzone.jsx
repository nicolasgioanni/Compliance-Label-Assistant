export default function ImageUploadDropzone({ disabled, maxQueueSize, onFilesAdded }) {
  function handleFileChange(event) {
    const nextFiles = Array.from(event.target.files || []);
    if (nextFiles.length) {
      onFilesAdded(nextFiles);
    }
    event.target.value = '';
  }

  return (
    <div className="upload-control">
      <label className={disabled ? 'dropzone disabled' : 'dropzone'}>
        <input
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          disabled={disabled}
          multiple
          type="file"
          onChange={handleFileChange}
        />
        <span>Add label images</span>
      </label>
      <p className="upload-helper">JPG or PNG only &bull; Maximum {maxQueueSize} labels</p>
    </div>
  );
}
