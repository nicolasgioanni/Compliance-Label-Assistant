import { getStatusClassName, getStatusLabel } from '../utils/statusStyles';
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
          <p className="summary-label">Selected Label</p>
          <h2>{item.filename}</h2>
        </div>
        <span className={getStatusClassName(result.overall_status)}>{getStatusLabel(result.overall_status)}</span>
        <button className="link-button" type="button" onClick={onEditExpectedData}>
          Edit Expected Data
        </button>
      </div>

      <dl className="result-meta-grid">
        <div>
          <dt>Overall Status</dt>
          <dd>{getStatusLabel(result.overall_status)}</dd>
        </div>
        <div>
          <dt>Processing Time</dt>
          <dd>{result.processing_time_ms} ms</dd>
        </div>
      </dl>

      {result.message ? <p className="result-note">{result.message}</p> : null}

      {standardFieldResults.length ? (
        <section className="workspace-section">
          <h3>Field Comparisons</h3>
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
