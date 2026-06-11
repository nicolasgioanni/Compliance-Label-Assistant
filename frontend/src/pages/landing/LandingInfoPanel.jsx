import { Fragment } from 'react';

const INFO_SECTIONS = [
  {
    title: 'Product Purpose And Role',
    body: 'Compliance Label Assistant is a prototype that helps compare alcohol label artwork with the application information a reviewer expects to see. It does not make the final decision for the reviewer; it organizes the evidence so the review is faster and easier to understand.',
    items: [
      'AI-assisted alcohol label review',
      'Built for label artwork and expected field data',
      'Designed to support, not replace, human review',
    ],
  },
  {
    title: 'Verification Capabilities',
    body: 'Upload label images, enter the expected application values, and get a field-by-field verification report. The backend reads visible label text, checks it against expected data, and shows where the label looks right, different, missing, or worth a closer look.',
    items: [
      'Extracts visible label fields from artwork',
      'Compares extracted text with expected values',
      'Shows clear field-level results',
      'Exports current results to CSV or XLSX',
    ],
  },
  {
    title: 'Intended Review Audience',
    body: 'This workflow is useful for anyone who needs to review several labels without losing track of what was checked. It keeps each label, expected data set, result, and export state organized in one place.',
    items: [
      'Reviewers comparing labels with application data',
      'Evaluators testing a deployed full-stack prototype',
      'Teams exploring AI-assisted document review',
    ],
  },
  {
    title: 'Supported Label Coverage',
    body: 'The current prototype focuses on common alcohol-label fields that can be compared against expected application data. It uses field-specific rules after extraction, instead of asking the AI model to make the final pass-or-fail decision.',
    items: [
      'Brand name and class or type',
      'Alcohol content, including ABV and proof',
      'Net contents with unit normalization',
      'Bottler or producer, country of origin, and warning text',
    ],
  },
  {
    title: 'Queue-Based Review Workflow',
    body: 'The app uses a queue-based review flow. Add labels, select one, enter expected values, run verification, review the result cards, then export the current findings when they are ready.',
    items: [
      'Queue up to 10 label images',
      'Track expected data per label',
      'Verify one label or all ready labels',
      'Review extracted fields, statuses, timing, and export results',
    ],
  },
  {
    title: 'Performance And Responsiveness',
    body: 'The app is built to feel fast for prototype review work. Images are resized before extraction, the backend can warm reusable provider dependencies, and ready-label checks use bounded concurrency. In documented warm-backend smoke tests, selected median runs completed under five seconds. These are observations, not an SLA.',
    items: [
      'Clean baseline: 2,556 ms median backend processing',
      'ABV mismatch case: 2,966 ms median backend processing',
      'Low-light mismatch case: 2,645 ms median backend processing',
      'Timing fields show validation, preprocessing, extraction, and verification durations',
    ],
  },
  {
    title: 'Prototype Scope And Limitations',
    body: 'This is an independent prototype, not an official TTB system and not a final legal compliance decision engine. It is built to assist review, while the final judgment stays with a human reviewer.',
    items: [
      'Human review remains final',
      'No COLA integration, accounts, database, or admin dashboard',
      'No persistent uploaded-file storage by application code',
      'Not production-hardened for government or restricted-network use',
    ],
  },
  {
    title: 'Architecture And Documentation',
    body: [
      'The ',
      { href: '/about', label: 'About page' },
      ' explains the system design in more detail, including the React frontend, FastAPI backend, image preprocessing, AI extraction boundary, deterministic verification rules, API shape, deployment model, and security limits.',
    ],
    items: [
      'Read the system overview and architecture notes',
      'Review frontend and backend responsibilities',
      'Inspect data flow, API, and deployment documentation',
    ],
  },
];

export default function LandingInfoPanel() {
  return (
    <section className="panel landing-info-panel" aria-labelledby="landing-page-title">
      <div className="landing-info-panel__scroll">
        <div className="landing-info-panel__intro">
          <h1 id="landing-page-title">Compliance Label Assistant</h1>
          <p className="static-page__subtitle">AI-assisted alcohol label verification</p>
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
              <p>{renderSectionBody(section.body)}</p>
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

function renderSectionBody(body) {
  const bodyParts = Array.isArray(body) ? body : [body];

  return bodyParts.map((part, index) => {
    if (typeof part === 'string') {
      return <Fragment key={`text-${index}`}>{part}</Fragment>;
    }

    return (
      <a className="landing-info-section__inline-link" href={part.href} key={`${part.href}-${index}`}>
        {part.label}
      </a>
    );
  });
}

function getSectionId(title) {
  return `landing-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}
