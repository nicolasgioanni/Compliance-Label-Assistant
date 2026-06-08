import { getStatusLabel, getStatusTextClassName } from '../utils/statusStyles';
import ExtractedTextPanel from './ExtractedTextPanel';
import FieldResultCard from './FieldResultCard';

const GOVERNMENT_WARNING_FIELD = 'government_warning';

export default function SelectedResultDetail({ item, onEditExpectedData }) {
  const result = item?.result;
  if (!item || !result) {
    return null;
  }

  const fieldResults = result.field_results || [];
  const governmentWarningResult = fieldResults.find((fieldResult) => fieldResult.field_name === GOVERNMENT_WARNING_FIELD);
  const standardFieldResults = fieldResults.filter((fieldResult) => fieldResult.field_name !== GOVERNMENT_WARNING_FIELD);

  return (
    <div className="selected-result-detail">
      <div className="result-detail-header">
        <div className="result-title-block">
          <h2>Selected Label Review</h2>
        </div>
        <button className="link-button" type="button" onClick={onEditExpectedData}>
          Edit Selected Label
        </button>
      </div>
      <p className="claim-context result-claim-context">
        <span className="claim-context-label">
          Selected Label: <strong>{item.filename}</strong>
        </span>
      </p>

      <dl className="result-meta-grid">
        <div>
          <dt>Overall Status</dt>
          <dd className={getStatusTextClassName(result.overall_status)}>{getStatusLabel(result.overall_status)}</dd>
        </div>
        <div>
          <dt>Processing Time</dt>
          <dd>{result.processing_time_ms} ms</dd>
        </div>
      </dl>

      {standardFieldResults.length ? (
        <section className="workspace-section">
          <h3>Verification Results</h3>
          <div className="result-grid result-grid-embedded">
            {standardFieldResults.map((fieldResult) => (
              <FieldResultCard key={fieldResult.field_name} result={fieldResult} />
            ))}
          </div>
        </section>
      ) : null}

      {governmentWarningResult ? (
        <section className="workspace-section">
          <h3>Government Warning Comparison</h3>
          <FieldResultCard result={governmentWarningResult} />
        </section>
      ) : null}

      <ExtractedTextPanel embedded extractedFields={result.extracted_fields} />
    </div>
  );
}
