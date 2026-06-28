const FOOTER_SUBTITLE = 'Independent prototype • v2.0.0';
const FOOTER_DISCLAIMER =
  'Independent software prototype. Not an official TTB, Treasury, or government system. AI-assisted verification results require human review and are not legal or regulatory advice.';
const FOOTER_COPYRIGHT = '© 2026 Nicolas Gioanni. Licensed under Apache License 2.0.';

const SOURCE_CODE_URL = 'https://github.com/nicolasgioanni/label-compliance-verifier';

const FOOTER_LINK_GROUPS = [
  {
    title: 'Project',
    links: [
      { href: '/about', label: 'About' },
      { href: '/app', label: 'Verification Tool' },
      {
        href: SOURCE_CODE_URL,
        label: 'Source Code',
        title: 'View source code on GitHub',
        external: true,
      },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Use' },
      { href: '/license', label: 'License' },
    ],
  },
];

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
          <div className="app-footer__link-groups">
            {FOOTER_LINK_GROUPS.map((group) => (
              <div className="app-footer__link-group" key={group.title}>
                <h2 className="app-footer__link-heading">{group.title}</h2>
                <ul className="app-footer__link-list">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        className="app-footer__link"
                        href={link.href}
                        rel={link.external ? 'noreferrer noopener' : undefined}
                        target={link.external ? '_blank' : undefined}
                        title={link.title}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      </div>

      <div className="app-footer__bottom">{FOOTER_COPYRIGHT}</div>
    </footer>
  );
}
