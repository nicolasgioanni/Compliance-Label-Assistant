import { useCallback, useEffect, useRef, useState } from 'react';
import ErrorBanner from '../components/shared/ErrorBanner';
import VerificationForm from '../components/verification/VerificationForm';

export default function ToolPage({ serviceErrorMessage = null }) {
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
    if (serviceErrorMessage) {
      showError(serviceErrorMessage);
    }
  }, [serviceErrorMessage, showError]);

  return (
    <>
      {activeError ? (
        <ErrorBanner
          key={activeError.id}
          message={activeError.message}
          tone={activeError.tone}
          onDismiss={dismissActiveError}
        />
      ) : null}
      <VerificationForm showError={showError} />
    </>
  );
}
