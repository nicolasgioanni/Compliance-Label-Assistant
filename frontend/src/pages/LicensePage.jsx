const LICENSE_URL = 'https://github.com/nicolasgioanni/label-compliance-verifier/blob/main/LICENSE';

export default function LicensePage() {
  return (
    <section className="static-page license-page" aria-labelledby="license-page-title">
      <section className="panel static-hero static-hero-compact" aria-labelledby="license-page-title">
        <h1 id="license-page-title">License</h1>
        <p>Compliance Label Assistant is an independent prototype by Nicolas Gioanni.</p>
        <p>
          <strong>Licensed under Apache License 2.0.</strong>
        </p>
        <p>The repository LICENSE file is the source of truth for the full license text.</p>
        <div className="static-page__actions" aria-label="License page actions">
          <a
            className="secondary-button static-page__button"
            href={LICENSE_URL}
            target="_blank"
            rel="noreferrer noopener"
          >
            View LICENSE on GitHub
          </a>
        </div>
        <p className="static-page__disclaimer">
          Independent prototype, not an official TTB system. Human review remains final.
        </p>
      </section>
    </section>
  );
}
