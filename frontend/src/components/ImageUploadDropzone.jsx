import { validateSingleFile } from '../utils/fileValidation';

export default function ImageUploadDropzone({ selectedFile, onFileChange }) {
  const validationMessage = selectedFile ? validateSingleFile(selectedFile) : '';

  function handleFileChange(event) {
    const nextFile = event.target.files?.[0] || null;
    onFileChange(nextFile);
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Label Image</h2>
      </div>
      <label className="dropzone">
        <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={handleFileChange} />
        <span>{selectedFile ? selectedFile.name : 'Choose a JPG or PNG label image'}</span>
      </label>
      {validationMessage ? <p className="field-warning">{validationMessage}</p> : null}
    </section>
  );
}

