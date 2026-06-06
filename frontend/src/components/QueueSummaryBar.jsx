const SUMMARY_ITEMS = [
  ['totalLabels', 'Total Labels'],
  ['readyLabels', 'Ready Labels'],
  ['verifiedLabels', 'Verified Labels'],
  ['passCount', 'Pass'],
  ['failCount', 'Fail'],
  ['needsReviewCount', 'Needs Review'],
  ['errorCount', 'Error'],
];

export default function QueueSummaryBar({ canExport = false, onExportCsv, summary }) {
  if (!summary) {
    return null;
  }

  return (
    <section className="queue-summary-bar" aria-label="Queue summary">
      <dl className="queue-summary-list">
        {SUMMARY_ITEMS.map(([key, label]) => (
          <div className="queue-summary-stat" key={key}>
            <dt>{label}</dt>
            <dd>{summary[key]}</dd>
          </div>
        ))}
      </dl>
      {canExport ? (
        <button className="secondary-button queue-summary-export" type="button" onClick={onExportCsv}>
          Export CSV
        </button>
      ) : null}
    </section>
  );
}
