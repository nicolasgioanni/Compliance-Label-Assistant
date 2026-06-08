export default function Header({ isOnline }) {
  return (
    <header className="page-header">
      <div className="brand-lockup">
        <img className="logo-mark" src="/cla-logo.png" alt="" aria-hidden="true" />
        <div className="brand-divider" aria-hidden="true" />
        <div className="brand-wordmark">
          <h1 className="brand-initials">CLA</h1>
          <p className="brand-title">Compliance Label Assistant</p>
          <div className="brand-rule" aria-hidden="true" />
          <p className="brand-subtitle">TTB Label Compliance Verification</p>
        </div>
      </div>
      <div className={isOnline ? 'system-pill online' : 'system-pill offline'} aria-live="polite">
        <span className="status-dot" />
        {isOnline ? 'System Online' : 'System Offline'}
      </div>
    </header>
  );
}
