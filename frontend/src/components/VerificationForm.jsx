import { useState } from 'react';
import { verifyBatchLabels, verifySingleLabel } from '../api/verificationApi';
import ErrorBanner from './ErrorBanner';
import ExpectedFieldsForm from './ExpectedFieldsForm';
import ExtractedTextPanel from './ExtractedTextPanel';
import FieldResultCard from './FieldResultCard';
import ImageUploadDropzone from './ImageUploadDropzone';
import LoadingState from './LoadingState';
import ResultsTable from './ResultsTable';
import ResultsSummary from './ResultsSummary';
import { downloadBatchResultsCsv } from '../utils/csvExport';
import { validateBatchFiles, validateExpectedFields, validateSingleFile } from '../utils/fileValidation';

const INITIAL_EXPECTED_FIELDS = {
  brandName: 'OLD TOM DISTILLERY',
  classType: 'Kentucky Straight Bourbon Whiskey',
  alcoholContent: '45% Alc./Vol. (90 Proof)',
  netContents: '750 mL',
  governmentWarning: '',
};

export default function VerificationForm() {
  const [mode, setMode] = useState('single');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [expectedFields, setExpectedFields] = useState(INITIAL_EXPECTED_FIELDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [selectedBatchIndex, setSelectedBatchIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setVerificationResult(null);
    setBatchResult(null);

    const fileWarning = mode === 'batch' ? validateBatchFiles(selectedFiles) : validateSingleFile(selectedFiles[0]);
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
      if (mode === 'batch') {
        const result = await verifyBatchLabels(selectedFiles, expectedFields);
        setBatchResult(result);
        setSelectedBatchIndex(0);
      } else {
        const result = await verifySingleLabel(selectedFiles[0], expectedFields);
        setVerificationResult(result);
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleModeChange(nextMode) {
    setMode(nextMode);
    setSelectedFiles([]);
    setVerificationResult(null);
    setBatchResult(null);
    setSelectedBatchIndex(0);
    setErrorMessage('');
  }

  const selectedBatchResult = batchResult?.results?.[selectedBatchIndex] || null;
  const resultForSummary = mode === 'batch' ? batchResult : verificationResult;
  const resultForDetails = mode === 'batch' ? selectedBatchResult : verificationResult;

  return (
    <form className="verification-layout" onSubmit={handleSubmit}>
      <div className="form-column">
        <ModeSelector mode={mode} onChange={handleModeChange} />
        <ImageUploadDropzone mode={mode} selectedFiles={selectedFiles} onFilesChange={setSelectedFiles} />
        <ExpectedFieldsForm expectedFields={expectedFields} onChange={setExpectedFields} />
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {mode === 'batch' ? 'Verify Batch' : 'Verify Label'}
        </button>
      </div>

      <div className="results-column">
        <ErrorBanner message={errorMessage} />
        {isSubmitting ? <LoadingState mode={mode} /> : null}
        <ResultsSummary result={resultForSummary} />
        {batchResult ? (
          <div className="result-actions">
            <button className="secondary-button" type="button" onClick={() => downloadBatchResultsCsv(batchResult)}>
              Export CSV
            </button>
          </div>
        ) : null}
        {batchResult ? (
          <ResultsTable
            results={batchResult.results}
            selectedIndex={selectedBatchIndex}
            onSelectResult={(_, index) => setSelectedBatchIndex(index)}
          />
        ) : null}
        <SelectedResultError result={resultForDetails} />
        {resultForDetails?.field_results?.length ? (
          <section className="result-grid">
            {resultForDetails.field_results.map((fieldResult) => (
              <FieldResultCard key={fieldResult.field_name} result={fieldResult} />
            ))}
          </section>
        ) : null}
        <ExtractedTextPanel extractedFields={resultForDetails?.extracted_fields} />
      </div>
    </form>
  );
}

function SelectedResultError({ result }) {
  if (!result?.error) {
    return null;
  }

  return (
    <section className="panel selected-error-panel">
      <div className="section-heading">
        <h2>Selected Label Error</h2>
      </div>
      <p>{result.error}</p>
    </section>
  );
}

function ModeSelector({ mode, onChange }) {
  return (
    <section className="panel">
      <div className="mode-toggle" aria-label="Verification mode">
        <button
          className={mode === 'single' ? 'mode-button active' : 'mode-button'}
          type="button"
          onClick={() => onChange('single')}
        >
          Single Label
        </button>
        <button
          className={mode === 'batch' ? 'mode-button active' : 'mode-button'}
          type="button"
          onClick={() => onChange('batch')}
        >
          Batch Upload
        </button>
      </div>
    </section>
  );
}
