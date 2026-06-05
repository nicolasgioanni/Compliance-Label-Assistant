export default function Header({ isOnline }) {
  return (
    <header className="page-header">
      <div className="brand-lockup">
        <div className="logo-mark" aria-hidden="true">
          CLA
        </div>
        <div>
          <h1>Compliance Label Assistant</h1>
          <p>TTB Label Compliance Verification</p>
        </div>
      </div>
      <div className={isOnline ? 'system-pill online' : 'system-pill offline'} aria-live="polite">
        <span className="status-dot" />
        {isOnline ? 'System Online' : 'System Offline'}
      </div>
    </header>
  );
}
