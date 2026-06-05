import { useCallback, useEffect, useState } from 'react';
import { checkHealth } from './api/verificationApi';
import AppFooter from './components/AppFooter';
import Header from './components/Header';
import VerificationForm from './components/VerificationForm';
import ErrorBanner from './components/ErrorBanner';

export default function App() {
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState('');
  const dismissHealthError = useCallback(() => setHealthError(''), []);

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
          setHealthError(getHealthErrorMessage(error));
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
      <Header isOnline={health?.status === 'ok'} />
      <div className="toast-region" aria-live="polite">
        {healthError ? (
          <ErrorBanner
            autoDismissMs={15000}
            dismissible
            message={healthError}
            onDismiss={dismissHealthError}
          />
        ) : null}
      </div>
      <VerificationForm />
      <AppFooter />
    </main>
  );
}

function getHealthErrorMessage(error) {
  if (error.message === 'Failed to fetch') {
    return 'The verification service is currently unavailable. Please try again shortly.';
  }

  return error.message || 'Cannot connect to the verification service.';
}
