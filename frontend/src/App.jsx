import { useCallback, useEffect, useRef, useState } from 'react';
import { checkHealth } from './api/verificationApi';
import AppFooter from './components/shared/AppFooter';
import Header from './components/shared/Header';
import VerificationForm from './components/verification/VerificationForm';
import ErrorBanner from './components/shared/ErrorBanner';
import { SERVICE_UNAVAILABLE_MESSAGE } from './constants/notificationMessages';

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
      tone: options.tone || 'error',
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
          tone={activeError.tone}
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
    return SERVICE_UNAVAILABLE_MESSAGE;
  }

  return error.message || 'Cannot connect to the verification service.';
}
