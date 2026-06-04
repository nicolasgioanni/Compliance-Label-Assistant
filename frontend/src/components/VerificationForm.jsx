import { useState } from 'react';
import { verifySingleLabel } from '../api/verificationApi';
import ErrorBanner from './ErrorBanner';
import ExpectedFieldsForm from './ExpectedFieldsForm';
import ExtractedTextPanel from './ExtractedTextPanel';
import FieldResultCard from './FieldResultCard';
import ImageUploadDropzone from './ImageUploadDropzone';
import LoadingState from './LoadingState';
import ResultsSummary from './ResultsSummary';
import { validateExpectedFields, validateSingleFile } from '../utils/fileValidation';

const INITIAL_EXPECTED_FIELDS = {
  brandName: 'OLD TOM DISTILLERY',
  classType: 'Kentucky Straight Bourbon Whiskey',
  alcoholContent: '45% Alc./Vol. (90 Proof)',
  netContents: '750 mL',
  governmentWarning: '',
};

export default function VerificationForm() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [expectedFields, setExpectedFields] = useState(INITIAL_EXPECTED_FIELDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setVerificationResult(null);

    const fileWarning = validateSingleFile(selectedFile);
    if (fileWarning) {
      setErrorMessage(fileWarning);
      return;
    }

    const fieldWarning = validateExpectedFields(expectedFields);
    if (fieldWarning) {
      setErrorMessage(fieldWarning);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifySingleLabel(selectedFile, expectedFields);
      setVerificationResult(result);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="verification-layout" onSubmit={handleSubmit}>
      <div className="form-column">
        <ImageUploadDropzone selectedFile={selectedFile} onFileChange={setSelectedFile} />
        <ExpectedFieldsForm expectedFields={expectedFields} onChange={setExpectedFields} />
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          Verify Label
        </button>
      </div>

      <div className="results-column">
        <ErrorBanner message={errorMessage} />
        {isSubmitting ? <LoadingState /> : null}
        <ResultsSummary result={verificationResult} />
        {verificationResult ? (
          <section className="result-grid">
            {verificationResult.field_results.map((fieldResult) => (
              <FieldResultCard key={fieldResult.field_name} result={fieldResult} />
            ))}
          </section>
        ) : null}
        <ExtractedTextPanel extractedFields={verificationResult?.extracted_fields} />
      </div>
    </form>
  );
}

