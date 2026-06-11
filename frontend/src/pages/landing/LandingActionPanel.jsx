const SOURCE_CODE_URL = 'https://github.com/nicolasgioanni/label-compliance-verifier';

export default function LandingActionPanel() {
  return (
    <aside className="panel landing-action-panel" aria-labelledby="landing-actions-title">
      <div className="landing-action-panel__content">
        <div className="landing-action-panel__intro">
          <h2 id="landing-actions-title">Get Started</h2>
          <p>Choose how you want to learn about the workflow or move directly into the app.</p>
        </div>
        <div className="landing-action-panel__actions" aria-label="Landing page actions">
          <a className="primary-button static-page__button landing-action-panel__button" href="/app">
            Verify Labels
          </a>
          <a
            className="primary-button static-page__button landing-action-panel__button"
            href={SOURCE_CODE_URL}
            target="_blank"
            rel="noreferrer noopener"
          >
            Source Code
          </a>
        </div>
        <div className="landing-action-panel__divider" aria-hidden="true" />
        <p className="landing-action-panel__copy">
          Want to understand the software architecture?{' '}
          <a className="landing-action-panel__link" href="/about">
            Read about CLA
          </a>
        </p>
      </div>
    </aside>
  );
}
