import { useEffect, useState } from 'react';
import { checkHealth } from './api/verificationApi';
import Header from './components/Header';
import VerificationForm from './components/VerificationForm';
import ErrorBanner from './components/ErrorBanner';

function formatHealthStatus(health) {
  if (!health) {
    return 'Checking backend connection...';
  }

  if (health.status === 'ok') {
    return `Backend connected: ${health.service}`;
  }

  return 'Backend connection unavailable';
}

export default function App() {
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadHealth() {
      try {
        const healthResponse = await checkHealth();
        if (isMounted) {
          setHealth(healthResponse);
          setHealthError('');
        }
      } catch (error) {
        if (isMounted) {
          setHealth({ status: 'error' });
          setHealthError(error.message);
        }
      }
    }

    loadHealth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="app-shell">
      <Header />
      <section className="connection-status" aria-live="polite">
        <span className={health?.status === 'ok' ? 'status-dot ok' : 'status-dot'} />
        {formatHealthStatus(health)}
      </section>
      {healthError ? <ErrorBanner message={healthError} /> : null}
      <VerificationForm />
    </main>
  );
}

