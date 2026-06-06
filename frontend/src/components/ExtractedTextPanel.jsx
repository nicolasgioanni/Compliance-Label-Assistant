const EXTRACTED_FIELD_LABELS = {
  brand_name: 'Brand Name',
  class_type: 'Class/Type',
  alcohol_content: 'Alcohol Content',
  net_contents: 'Net Contents',
  government_warning_text: 'Government Warning',
};

export default function ExtractedTextPanel({ embedded = false, extractedFields }) {
  if (!extractedFields) {
    return null;
  }

  const rawText = extractedFields.raw_text || 'No extracted text returned.';
  const className = embedded ? 'extracted-text-panel extracted-text-panel-embedded' : 'panel extracted-text-panel';

  return (
    <section className={className}>
      <div className="section-heading">
        <h2>Extracted Text</h2>
      </div>
      <dl className="extracted-list">
        {Object.entries(EXTRACTED_FIELD_LABELS).map(([key, label]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>{extractedFields[key] || 'Not found'}</dd>
          </div>
        ))}
      </dl>
      <h3>Raw Text</h3>
      <pre className="raw-text">{rawText}</pre>
    </section>
  );
}
