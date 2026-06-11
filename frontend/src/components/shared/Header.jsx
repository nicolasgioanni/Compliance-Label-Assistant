const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/app', label: 'Verification Tool' },
];

export default function Header({ activePath = '/', serviceStatus = 'checking' }) {
  const statusClassName = getStatusClassName(serviceStatus);
  const statusLabel = getStatusLabel(serviceStatus);

  return (
    <header className="page-header">
      <div className="brand-lockup">
        <img className="logo-mark" src="/cla-logo.png" alt="" aria-hidden="true" />
        <div className="brand-divider" aria-hidden="true" />
        <div className="brand-wordmark">
          <span className="brand-initials">CLA</span>
          <p className="brand-title">Compliance Label Assistant</p>
          <div className="brand-rule" aria-hidden="true" />
          <p className="brand-subtitle">AI-assisted alcohol label verification</p>
        </div>
      </div>
      <div className="page-header__actions">
        <div className="page-header__status-row">
          <div className={statusClassName} aria-live="polite">
            <span className="status-dot" />
            {statusLabel}
          </div>
        </div>
        <nav className="primary-nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const isActive = activePath === item.href;

            return (
              <a
                aria-current={isActive ? 'page' : undefined}
                className="primary-nav__link"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function getStatusClassName(serviceStatus) {
  if (serviceStatus === 'online') {
    return 'system-pill online';
  }

  if (serviceStatus === 'offline') {
    return 'system-pill offline';
  }

  return 'system-pill checking';
}

function getStatusLabel(serviceStatus) {
  if (serviceStatus === 'online') {
    return 'System Online';
  }

  if (serviceStatus === 'offline') {
    return 'System Offline';
  }

  return 'Checking Status';
}
