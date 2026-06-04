import { getStatusClassName, getStatusLabel } from '../utils/statusStyles';

export default function ResultsSummary({ result }) {
  if (!result) {
    return null;
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
      {result.message ? <p className="mock-note">{result.message}</p> : null}
    </section>
  );
}

