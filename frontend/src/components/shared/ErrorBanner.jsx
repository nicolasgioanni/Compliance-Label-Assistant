import { useEffect, useState } from 'react';

export default function ErrorBanner({ autoDismissMs = 15000, dismissible = true, message, onDismiss, tone = 'error' }) {
  const [isVisible, setIsVisible] = useState(Boolean(message));
  const bannerTone = getBannerTone(tone);

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
    <div className="error-banner-layer">
      <div className={`error-banner error-banner-${bannerTone}`} role="alert">
        <span>{message}</span>
        {dismissible ? (
          <button aria-label="Dismiss error message" className="error-banner-close" type="button" onClick={handleDismiss}>
            X
          </button>
        ) : null}
      </div>
    </div>
  );
}

function getBannerTone(tone) {
  return ['error', 'info', 'warning'].includes(tone) ? tone : 'error';
}
