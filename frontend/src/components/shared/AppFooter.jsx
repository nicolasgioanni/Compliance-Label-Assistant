const FOOTER_SUBTITLE = 'Independent prototype • v1.0.0';
const FOOTER_DISCLAIMER =
  'Independent software prototype. Not an official TTB, Treasury, or government system. AI-assisted verification results require human review and are not legal or regulatory advice.';
const FOOTER_COPYRIGHT = '© 2026 Nicolas Gioanni. Licensed under Apache License 2.0.';

export default function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <div className="app-footer__brand">
          <img className="app-footer__logo" src="/cla-logo.png" alt="Compliance Label Assistant logo" />
          <div className="app-footer__identity">
            <div className="app-footer__title">Compliance Label Assistant</div>
            <div className="app-footer__subtitle">{FOOTER_SUBTITLE}</div>
          </div>
        </div>

        <p className="app-footer__disclaimer">{FOOTER_DISCLAIMER}</p>

        <nav className="app-footer__links" aria-label="Footer navigation">
          <a
            className="app-footer__link"
            href="https://github.com/nicolasgioanni/label-compliance-verifier"
            target="_blank"
            rel="noreferrer noopener"
            title="View source code on GitHub"
          >
            Source Code
          </a>
          <a className="app-footer__link" href="/license">
            License
          </a>
          <a className="app-footer__link" href="/about">
            About
          </a>
          <a className="app-footer__link" href="/app">
            Verification Tool
          </a>
        </nav>
      </div>

      <div className="app-footer__bottom">{FOOTER_COPYRIGHT}</div>
    </footer>
  );
}
