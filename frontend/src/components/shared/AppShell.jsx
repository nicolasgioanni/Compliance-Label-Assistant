// Provides the shared header, footer, and route body shell.
import AppFooter from './AppFooter';
import Header from './Header';

export default function AppShell({ activePath = '/', children, serviceStatus = 'checking' }) {
  return (
    <div className="app-shell">
      <Header activePath={activePath} serviceStatus={serviceStatus} />
      <main className="app-main">
        <div className="page-body-transition" key={activePath}>
          {children}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
