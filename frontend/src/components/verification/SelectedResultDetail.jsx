import { getStatusLabel, getStatusTextClassName } from '../../utils/statusStyles';
import { getAutomatedStatus } from '../../utils/statusResolution';
import InfoTooltip from '../shared/InfoTooltip';
import ExtractedTextPanel from './ExtractedTextPanel';
import FieldResultCard from './FieldResultCard';

const GOVERNMENT_WARNING_FIELD = 'government_warning';

export default function SelectedResultDetail({
  areActionsDisabled = false,
  item,
  onEditExpectedData,
}) {
  const result = item?.result;
  if (!item || !result) {
    return null;
  }

  const automatedStatus = getAutomatedStatus(item);
  const fieldResults = result.field_results || [];
  const governmentWarningResult = fieldResults.find((fieldResult) => fieldResult.field_name === GOVERNMENT_WARNING_FIELD);
  const standardFieldResults = fieldResults.filter((fieldResult) => fieldResult.field_name !== GOVERNMENT_WARNING_FIELD);

  return (
    <div className="selected-result-detail">
      <div className="result-detail-header">
        <div className="result-title-block">
          <div className="section-title-row">
            <h2>Selected Label Review</h2>
            <InfoTooltip label="About selected label results">
              This view shows the verification result for the selected label. Overall Status summarizes the backend
              check, each field card compares the expected value with what was found, and Extracted Label Text shows
              what the AI read from the image. Select another label in the queue to review its result, or edit this
              label's expected data and rerun verification if the application values need to change.
            </InfoTooltip>
          </div>
        </div>
        <div className="result-header-actions">
          <button
            className="link-button"
            disabled={areActionsDisabled}
            type="button"
            onClick={onEditExpectedData}
          >
            Edit Selected Label
          </button>
        </div>
      </div>
      <p className="claim-context result-claim-context">
        <span className="claim-context-label">
          Selected Label: <strong>{item.filename}</strong>
        </span>
      </p>

      <ResultMetaGrid
        automatedStatus={automatedStatus}
        processingTimeMs={result.processing_time_ms}
      />

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

function ResultMetaGrid({ automatedStatus, processingTimeMs }) {
  return (
    <dl className="result-meta-grid">
      <div>
        <dt>Overall Status</dt>
        <dd className={getStatusTextClassName(automatedStatus)}>{getStatusLabel(automatedStatus)}</dd>
      </div>
      <div>
        <dt>Processing Time</dt>
        <dd>{processingTimeMs} ms</dd>
      </div>
    </dl>
  );
}
