import { useEffect, useState } from 'react';

export default function ErrorBanner({ autoDismissMs = 0, dismissible = false, message, onDismiss }) {
  const [isVisible, setIsVisible] = useState(Boolean(message));

  useEffect(() => {
    setIsVisible(Boolean(message));

    if (!message || !autoDismissMs) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, autoDismissMs);

    return () => window.clearTimeout(timeoutId);
  }, [autoDismissMs, message, onDismiss]);

  if (!message || !isVisible) {
    return null;
  }

  function handleDismiss() {
    setIsVisible(false);
    onDismiss?.();
  }

  return (
    <div className="error-banner" role="alert">
      <span>{message}</span>
      {dismissible ? (
        <button aria-label="Dismiss error message" className="error-banner-close" type="button" onClick={handleDismiss}>
          X
        </button>
      ) : null}
    </div>
  );
}
