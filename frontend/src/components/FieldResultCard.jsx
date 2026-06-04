import { getStatusClassName, getStatusLabel } from '../utils/statusStyles';

export default function FieldResultCard({ result }) {
  return (
    <article className="field-card">
      <div className="field-card-header">
        <h3>{result.field_name.replaceAll('_', ' ')}</h3>
        <span className={getStatusClassName(result.status)}>{getStatusLabel(result.status)}</span>
      </div>
      <dl>
        <div>
          <dt>Expected</dt>
          <dd>{result.expected}</dd>
        </div>
        <div>
          <dt>Found</dt>
          <dd>{result.found || 'Not found'}</dd>
        </div>
        <div>
          <dt>Reason</dt>
          <dd>{result.reason}</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>{Math.round(result.confidence * 100)}%</dd>
        </div>
      </dl>
    </article>
  );
}

