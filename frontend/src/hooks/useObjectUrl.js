// Creates short-lived browser object URLs for local file previews.
import { useEffect, useState } from 'react';

export function useObjectUrl(value) {
  const [objectUrl, setObjectUrl] = useState('');

  useEffect(() => {
    if (!value || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      setObjectUrl('');
      return undefined;
    }

    const nextObjectUrl = URL.createObjectURL(value);
    setObjectUrl(nextObjectUrl);

    return () => {
      // Revoke previews on cleanup so queued files do not leak browser memory.
      if (typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(nextObjectUrl);
      }
    };
  }, [value]);

  return objectUrl;
}
