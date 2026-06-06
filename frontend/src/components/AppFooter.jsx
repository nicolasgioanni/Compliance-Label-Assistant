export default function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer__notice">
        <span className="app-footer__primary">
          Prototype compliance-assistance tool. Human review remains final.
        </span>
        <span className="app-footer__secondary">
          Independent prototype. Not an official TTB system.
        </span>
      </div>
      <div className="app-footer__meta" aria-label="Prototype limitations and source code">
        <span>No COLA integration</span>
        <span className="app-footer__separator" aria-hidden="true">
          &bull;
        </span>
        <span>No persistent file storage</span>
        <span className="app-footer__separator" aria-hidden="true">
          &bull;
        </span>
        <a
          className="app-footer__link"
          href="https://github.com/nicolasgioanni/label-compliance-verifier"
          target="_blank"
          rel="noreferrer noopener"
          title="View source code on GitHub"
        >
          Source Code
        </a>
      </div>
    </footer>
  );
}
