import {
  LICENSE_ACTIONS,
  LICENSE_DISCLAIMER,
  LICENSE_DISCLAIMER_LABEL,
  LICENSE_INTRO,
  LICENSE_SUMMARY_SECTIONS,
} from './license/licenseContent';

export default function LicensePage() {
  return (
    <section className="static-page license-page" aria-labelledby="license-page-title">
      <div className="panel license-page__panel">
        <div className="license-page__scroll">
          <div className="license-page__intro">
            <h1 id="license-page-title">License</h1>
            <p className="static-page__description">{LICENSE_INTRO}</p>
          </div>
          <div className="landing-info-panel__divider license-page__divider" role="separator" aria-hidden="true" />

          <div className="license-page__summary-grid">
            {LICENSE_SUMMARY_SECTIONS.map((section) => (
              <section
                className="license-page__summary-section"
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

          <p className="license-page__disclaimer">
            <strong className="license-page__disclaimer-label">{LICENSE_DISCLAIMER_LABEL}</strong> {LICENSE_DISCLAIMER}
          </p>
        </div>
      </div>

      <div className="verification-actions license-page__actions" aria-label="License page actions">
        {LICENSE_ACTIONS.map((action) => (
          <a
            className="primary-button static-page__button license-page__button"
            href={action.href}
            key={action.href}
            target="_blank"
            rel="noreferrer noopener"
          >
            {action.label}
          </a>
        ))}
      </div>
    </section>
  );
}

function getSectionId(title) {
  return `license-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}
