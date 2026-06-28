import { SkeletonBlock, SkeletonText } from '../shared/Skeleton';
import InfoTooltip from '../shared/InfoTooltip';

const STANDARD_RESULT_FIELDS = ['Brand Name', 'Class / Type', 'Alcohol Content', 'Net Contents'];
const EXTRACTED_FIELD_LABELS = [
  'Brand Name',
  'Class/Type',
  'Alcohol Content',
  'Net Contents',
  'Bottler/Producer',
  'Country of Origin',
];

export default function SelectedResultSkeleton({ filename }) {
  return (
    <div className="selected-result-detail selected-result-skeleton" aria-busy="true">
      <span className="sr-only" role="status" aria-live="polite">
        Verifying Label
      </span>
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
        <div className="result-header-actions" aria-hidden="true">
          <SkeletonText height="1rem" width="8.15rem" />
        </div>
      </div>
      <p className="claim-context result-claim-context">
        <span className="claim-context-label">
          Selected Label: <strong>{filename}</strong>
        </span>
      </p>

      <dl className="result-meta-grid">
        <div>
          <dt>Overall Status</dt>
          <dd className="selected-result-skeleton__meta-value">
            <SkeletonText height="1rem" width="3.3rem" />
          </dd>
        </div>
        <div>
          <dt>Processing Time</dt>
          <dd className="selected-result-skeleton__meta-value">
            <SkeletonText height="1rem" width="4.6rem" />
          </dd>
        </div>
      </dl>

      <section className="workspace-section" aria-hidden="true">
        <h3>Verification Results</h3>
        <div className="result-grid result-grid-embedded">
          {STANDARD_RESULT_FIELDS.map((fieldName) => (
            <FieldResultSkeleton fieldName={fieldName} key={fieldName} />
          ))}
        </div>
      </section>

      <section className="workspace-section" aria-hidden="true">
        <h3>Government Warning Comparison</h3>
        <FieldResultSkeleton fieldName="Government Warning" isWide />
      </section>

      <section className="extracted-text-panel extracted-text-panel-embedded" aria-hidden="true">
        <div className="section-heading">
          <h2>Extracted Text</h2>
        </div>
        <dl className="extracted-list selected-result-skeleton__extracted-list">
          {EXTRACTED_FIELD_LABELS.map((label, index) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>
                <SkeletonText width={index % 2 === 0 ? '72%' : '54%'} />
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

function FieldResultSkeleton({ fieldName, isWide = false }) {
  return (
    <article className="field-card selected-result-skeleton__field-card">
      <div className="field-card-header">
        <h3>{fieldName}</h3>
        <SkeletonBlock height="1.55rem" radius="999px" width="3.35rem" />
      </div>
      <dl>
        <div>
          <dt>Expected</dt>
          <dd>
            <SkeletonText width={isWide ? '84%' : '74%'} />
          </dd>
        </div>
        <div>
          <dt>Observed</dt>
          <dd>
            <SkeletonText width={isWide ? '78%' : '66%'} />
          </dd>
        </div>
        <div>
          <dt>Reason</dt>
          <dd className="skeleton-stack">
            <SkeletonText width="100%" />
            <SkeletonText width={isWide ? '88%' : '76%'} />
          </dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>
            <SkeletonText width="4rem" />
          </dd>
        </div>
      </dl>
    </article>
  );
}
