import { DEFAULT_GOVERNMENT_WARNING } from '../../constants/defaultWarningText';
import {
  createEmptyExpectedFields,
  EXAMPLE_EXPECTED_FIELDS,
  VISIBLE_EXPECTED_FIELD_DEFINITIONS,
} from '../../utils/expectedFields';
import InfoTooltip from '../shared/InfoTooltip';

export default function ExpectedFieldsForm({
  canBackToResults = false,
  canCopyClaimData = false,
  copyClaimDataDisabledReason = '',
  contextFilename,
  disabled = false,
  expectedFields,
  onBackToResults,
  onChange,
  onCopyClaimData,
}) {
  const isBrandReady = Boolean(expectedFields.brandName?.trim());
  const isCopyClaimDataEnabled = !disabled && canCopyClaimData;
  const claimStatus = isBrandReady ? 'Ready' : 'Brand name required';

  function updateField(fieldName, value) {
    onChange({ ...expectedFields, governmentWarning: DEFAULT_GOVERNMENT_WARNING, [fieldName]: value });
  }

  function useExample() {
    onChange({ ...expectedFields, ...EXAMPLE_EXPECTED_FIELDS });
  }

  function clearFields() {
    onChange(createEmptyExpectedFields());
  }

  return (
    <div className="expected-fields-form">
      <div className="section-heading">
        <div className="expected-form-heading-row">
          <div className="section-title-row">
            <h2>Selected Label Review</h2>
            <InfoTooltip label="About selected label review">
              Enter the product values the selected label should match. Brand name is required to verify a label; the
              other visible fields are optional and only checked when provided. The standard government warning is
              applied automatically.
            </InfoTooltip>
          </div>
          <span
            className={
              isBrandReady
                ? 'claim-status-pill claim-status-pill-ready'
                : 'claim-status-pill claim-status-pill-incomplete'
            }
          >
            {claimStatus}
          </span>
        </div>
        {contextFilename ? (
          <p className={isBrandReady ? 'claim-context claim-context-ready' : 'claim-context claim-context-incomplete'}>
            <span className="claim-context-label">
              Editing selected label: <strong>{contextFilename}</strong>
            </span>
            <span className="claim-context-actions">
              <button
                className="link-button expected-example-action"
                disabled={disabled}
                type="button"
                onClick={useExample}
              >
                Load Example
              </button>
              <span className="claim-context-action-separator" aria-hidden="true" />
              <button
                className="link-button expected-clear-action"
                disabled={disabled}
                type="button"
                onClick={clearFields}
              >
                Clear Fields
              </button>
            </span>
          </p>
        ) : null}
      </div>
      <div className="form-grid">
        {VISIBLE_EXPECTED_FIELD_DEFINITIONS.map((field) => (
          <label className="field" key={field.id}>
            <span>
              {field.label}
              {field.required ? (
                <abbr className="required-marker" title="Required">
                  *
                </abbr>
              ) : null}
            </span>
            <input
              disabled={disabled}
              type={field.type}
              value={expectedFields[field.id] || ''}
              onChange={(event) => updateField(field.id, event.target.value)}
            />
          </label>
        ))}
      </div>
      <div className="form-actions">
        {canBackToResults ? (
          <button
            className="secondary-button export-dialog-back-button expected-back-to-results-button"
            type="button"
            onClick={onBackToResults}
          >
            Back to Results
          </button>
        ) : null}
        <button
          className="primary-button expected-copy-claim-data-button"
          disabled={!isCopyClaimDataEnabled}
          title={!isCopyClaimDataEnabled ? copyClaimDataDisabledReason : undefined}
          type="button"
          onClick={onCopyClaimData}
        >
          Copy Claim Data
        </button>
      </div>
    </div>
  );
}
