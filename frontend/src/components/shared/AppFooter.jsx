export default function AppFooter() {
  return (
    <footer className="app-footer">
      <p className="app-footer__notice">
        Copyright 2026 Nicolas Gioanni. Compliance Label Assistant is an independent prototype. Licensed under Apache
        License 2.0.
      </p>
      <nav className="app-footer__meta" aria-label="Footer">
        <a className="app-footer__link" href="/license">
          License
        </a>
        <span className="app-footer__separator" aria-hidden="true">
          |
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
        <span className="app-footer__separator" aria-hidden="true">
          |
        </span>
        <a className="app-footer__link" href="/app">
          Verification Tool
        </a>
      </nav>
    </footer>
  );
}
