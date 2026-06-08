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
      if (typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(nextObjectUrl);
      }
    };
  }, [value]);

  return objectUrl;
}
