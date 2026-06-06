import { useCallback, useEffect, useRef, useState } from 'react';
import { checkHealth } from './api/verificationApi';
import AppFooter from './components/AppFooter';
import Header from './components/Header';
import VerificationForm from './components/VerificationForm';
import ErrorBanner from './components/ErrorBanner';

export default function App() {
  const [health, setHealth] = useState(null);
  const [activeError, setActiveError] = useState(null);
  const activeErrorRef = useRef(null);
  const nextErrorIdRef = useRef(0);

  const dismissActiveError = useCallback(() => {
    const currentError = activeErrorRef.current;
    activeErrorRef.current = null;
    currentError?.onDismiss?.();
    setActiveError(null);
  }, []);

  const showError = useCallback((message, options = {}) => {
    const currentError = activeErrorRef.current;
    currentError?.onDismiss?.();

    if (!message) {
      activeErrorRef.current = null;
      setActiveError(null);
      return;
    }

    const nextError = {
      id: nextErrorIdRef.current + 1,
      message,
      onDismiss: options.onDismiss,
    };

    nextErrorIdRef.current = nextError.id;
    activeErrorRef.current = nextError;
    setActiveError(nextError);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadHealth() {
      try {
        const healthResponse = await checkHealth();
        if (isMounted) {
          setHealth(healthResponse);
        }
      } catch (error) {
        if (isMounted) {
          setHealth({ status: 'error' });
          showError(getHealthErrorMessage(error));
        }
      }
    }

    loadHealth();

    return () => {
      isMounted = false;
    };
  }, [showError]);

  return (
    <main className="app-shell">
      <Header isOnline={health?.status === 'ok'} />
      {activeError ? (
        <ErrorBanner
          key={activeError.id}
          message={activeError.message}
          onDismiss={dismissActiveError}
        />
      ) : null}
      <VerificationForm showError={showError} />
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
