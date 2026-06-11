const INFO_SECTIONS = [
  {
    title: 'What It Does',
    body: 'Compliance Label Assistant turns label artwork review into a structured evidence workflow. It extracts visible alcohol-label fields with a backend AI vision pipeline, then compares those fields against expected application data with deterministic rules that are easier to inspect, test, and explain.',
    items: [
      'AI-assisted extraction for visible label fields',
      'Deterministic comparison logic after extraction',
      'Field-level evidence for pass, fail, missing, and needs-review outcomes',
      'Current-result export to CSV and XLSX',
    ],
  },
  {
    title: 'Who It Is For',
    body: 'The workflow is built for reviewers and evaluators who need to move quickly through routine label-to-application comparisons without losing field-level traceability. It is especially useful when multiple labels need organized review before a final human decision.',
    items: [
      'Reviewers comparing artwork against expected application values',
      'Evaluators inspecting a full-stack AI-assisted verification prototype',
      'Teams exploring structured review queues for document-heavy workflows',
    ],
  },
  {
    title: 'What It Can Check',
    body: 'The current rules cover the core demonstration fields for alcohol label review and keep each decision visible. Text normalization, numeric parsing, and stricter warning-text checks help separate safe matches from mismatches and manual-review cases.',
    items: [
      'Brand name and class or type',
      'Alcohol content, including ABV and proof equivalence',
      'Net contents with milliliter/liter normalization',
      'Bottler or producer, country of origin, and government warning wording',
    ],
  },
  {
    title: 'Workflow',
    body: 'The browser workflow is queue-first. Each uploaded label keeps its own expected data, status, result evidence, stale-result state, and export eligibility, so a reviewer can inspect one label or run through ready labels without mixing review context.',
    items: [
      'Queue up to 10 JPG, PNG, WebP, or TIFF label images',
      'Enter expected values per selected label',
      'Verify one selected label or all ready labels',
      'Review field cards, extracted values, timing data, and exportable results',
    ],
  },
  {
    title: 'Performance Snapshot',
    body: 'The prototype includes practical speed and cost controls: image preprocessing reduces provider payloads, warmup initializes reusable backend dependencies, and queue verification uses bounded concurrency. A documented warm-backend smoke test on synthetic fixtures reported all selected medians under five seconds.',
    items: [
      'Clean baseline fixture: 2,556 ms median backend processing',
      'Intentional ABV mismatch fixture: 2,966 ms median backend processing',
      'Low-light mismatch fixture: 2,645 ms median backend processing',
      'Timing fields expose validation, preprocessing, extraction, and verification durations',
    ],
  },
  {
    title: 'Prototype Boundaries',
    body: 'This is an independent prototype for compliance assistance, not an official TTB system or final legal decision engine. The architecture intentionally avoids persistent upload storage, browser-exposed provider keys, auth, databases, admin tooling, and COLA integration.',
    items: [
      'Human review remains final',
      'Uploaded files are processed temporarily by application code',
      'Frontend never receives the OpenAI API key',
      'Not production-hardened for government or restricted-network use',
    ],
  },
];

export default function LandingInfoPanel() {
  return (
    <section className="panel landing-info-panel" aria-labelledby="landing-page-title">
      <div className="landing-info-panel__scroll">
        <div className="landing-info-panel__intro">
          <p className="static-page__eyebrow">AI-assisted alcohol label verification</p>
          <h1 id="landing-page-title">Compliance Label Assistant</h1>
          <p className="static-page__description">
            Upload label artwork, enter expected application data, and generate a field-by-field verification report.
          </p>
        </div>
        <div className="landing-info-panel__divider" role="separator" aria-hidden="true" />

        <div className="landing-info-grid">
          {INFO_SECTIONS.map((section) => (
            <section
              className="landing-info-section"
              key={section.title}
              aria-labelledby={getSectionId(section.title)}
            >
              <h2 id={getSectionId(section.title)}>{section.title}</h2>
              <p>{section.body}</p>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

function getSectionId(title) {
  return `landing-${title.toLowerCase().replaceAll(' ', '-')}`;
}
