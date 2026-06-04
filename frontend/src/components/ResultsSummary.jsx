import { getStatusClassName, getStatusLabel } from '../utils/statusStyles';

export default function ResultsSummary({ result }) {
  if (!result) {
    return null;
  }

  if (result.mode === 'batch') {
    return <BatchResultsSummary result={result} />;
  }

  return (
    <section className="panel result-summary">
      <div>
        <p className="summary-label">Overall Status</p>
        <span className={getStatusClassName(result.overall_status)}>
          {getStatusLabel(result.overall_status)}
        </span>
      </div>
      <div>
        <p className="summary-label">Filename</p>
        <strong>{result.filename}</strong>
      </div>
      <div>
        <p className="summary-label">Processing Time</p>
        <strong>{result.processing_time_ms} ms</strong>
      </div>
      {result.message ? <p className="result-note">{result.message}</p> : null}
    </section>
  );
}

function BatchResultsSummary({ result }) {
  const statusCounts = result.status_counts || {};

  return (
    <section className="panel result-summary batch-summary">
      <div>
        <p className="summary-label">Total Labels</p>
        <strong>{result.total_labels}</strong>
      </div>
      <div>
        <p className="summary-label">Completed</p>
        <strong>{result.completed}</strong>
      </div>
      <div>
        <p className="summary-label">Total Processing Time</p>
        <strong>{result.total_processing_time_ms} ms</strong>
      </div>
      <StatusCount label="Pass" value={statusCounts.pass || 0} status="pass" />
      <StatusCount label="Fail" value={statusCounts.fail || 0} status="fail" />
      <StatusCount label="Needs Review" value={statusCounts.needs_review || 0} status="needs_review" />
      <StatusCount label="Error" value={statusCounts.error || 0} status="error" />
    </section>
  );
}

function StatusCount({ label, value, status }) {
  return (
    <div>
      <p className="summary-label">{label}</p>
      <span className={getStatusClassName(status)}>{value}</span>
    </div>
  );
}
