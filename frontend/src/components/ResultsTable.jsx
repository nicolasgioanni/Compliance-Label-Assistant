import { getStatusClassName, getStatusLabel } from '../utils/statusStyles';

const FIELD_COLUMNS = [
  ['brand_name', 'Brand'],
  ['class_type', 'Class/Type'],
  ['alcohol_content', 'Alcohol'],
  ['net_contents', 'Net Contents'],
  ['government_warning', 'Warning'],
];

export default function ResultsTable({ results, selectedIndex, onSelectResult }) {
  if (!results?.length) {
    return null;
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Batch Results</h2>
      </div>
      <div className="table-scroll">
        <table className="results-table">
          <thead>
            <tr>
              <th>Filename</th>
              <th>Overall</th>
              {FIELD_COLUMNS.map(([, label]) => (
                <th key={label}>{label}</th>
              ))}
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr
                className={index === selectedIndex ? 'selected-row' : ''}
                key={`${result.filename}-${index}`}
                onClick={() => onSelectResult(result, index)}
              >
                <td>{result.filename}</td>
                <td>
                  <StatusPill status={result.overall_status} />
                </td>
                {FIELD_COLUMNS.map(([fieldName]) => (
                  <td key={fieldName}>
                    <StatusPill status={getFieldStatus(result, fieldName)} />
                  </td>
                ))}
                <td>{result.processing_time_ms} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusPill({ status }) {
  return <span className={getStatusClassName(status)}>{getStatusLabel(status)}</span>;
}

function getFieldStatus(result, fieldName) {
  if (result.overall_status === 'error') {
    return 'error';
  }

  return result.field_results.find((fieldResult) => fieldResult.field_name === fieldName)?.status || 'needs_review';
}
