const GITHUB_DOC_BASE_URL = 'https://github.com/nicolasgioanni/label-compliance-verifier/blob/main/';

const ABOUT_SECTIONS = [
  {
    title: 'System Overview',
    body: 'Compliance Label Assistant is a React and FastAPI prototype for reviewing alcohol label artwork against expected application data. The frontend owns upload, queue, expected-field entry, result review, and export workflows. The backend owns validation, image preprocessing, AI extraction, deterministic verification, and structured response construction.',
  },
  {
    title: 'Frontend Architecture',
    body: 'The frontend is a Vite React application with lightweight path-based pages, a shared shell, local queue state, and a centralized API client. Verification UI components remain focused on rendering and interaction, while helpers handle file validation, queue state transitions, status formatting, and export generation.',
  },
  {
    title: 'Backend Architecture',
    body: 'The backend is a FastAPI service with thin routes and separate modules for workflow orchestration, upload validation, image preprocessing, OpenAI provider access, deterministic field comparison, response building, and configuration. Provider-specific code is isolated from verification rules.',
  },
  {
    title: 'Extraction And Verification Flow',
    body: 'Uploaded images are validated and preprocessed in memory before provider extraction. Extracted fields are compared against expected values with deterministic rules for text normalization, alcohol content, net contents, government warning text, and reviewable near matches. The response returns field-level evidence and an overall status.',
  },
  {
    title: 'Security And Prototype Boundaries',
    body: 'The frontend never exposes the OpenAI API key. Uploaded files are processed temporarily and are not persistently stored by application code. This prototype does not include authentication, a database, admin tools, COLA integration, or final legal compliance determinations. Human review remains final.',
  },
];

const DOCUMENTATION_LINKS = [
  {
    label: 'Frontend architecture',
    path: 'docs/architecture/frontend-architecture.md',
  },
  {
    label: 'Backend architecture',
    path: 'docs/architecture/backend-architecture.md',
  },
  {
    label: 'Extraction and verification flow',
    path: 'docs/architecture/extraction-verification-flow.md',
  },
  {
    label: 'Data flow',
    path: 'docs/architecture/data-flow.md',
  },
  {
    label: 'API overview',
    path: 'docs/api/overview.md',
  },
  {
    label: 'Deployment overview',
    path: 'docs/deployment/overview.md',
  },
];

export default function AboutPage() {
  return (
    <section className="static-page about-page" aria-labelledby="about-page-title">
      <div className="panel about-page__panel">
        <div className="about-page__intro">
          <p className="static-page__eyebrow">Architecture and implementation notes</p>
          <h1 id="about-page-title">About</h1>
          <p className="static-page__description">
            A concise technical overview of how the frontend, backend, extraction boundary, verification rules, and
            deployment model fit together.
          </p>
        </div>

        <div className="about-section-grid">
          {ABOUT_SECTIONS.map((section) => (
            <section className="about-section" key={section.title} aria-labelledby={getSectionId(section.title)}>
              <h2 id={getSectionId(section.title)}>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>

        <section className="about-docs" aria-labelledby="about-docs-title">
          <h2 id="about-docs-title">Source Documentation</h2>
          <div className="about-docs__links">
            {DOCUMENTATION_LINKS.map((link) => (
              <a
                className="about-docs__link"
                href={`${GITHUB_DOC_BASE_URL}${link.path}`}
                key={link.path}
                target="_blank"
                rel="noreferrer noopener"
              >
                <span>{link.label}</span>
                <code>{link.path}</code>
              </a>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function getSectionId(title) {
  return `about-${title.toLowerCase().replaceAll(' ', '-')}`;
}
