import { useEffect, useState } from 'react';
import { checkHealth } from '../api/verificationApi';
import { SERVICE_UNAVAILABLE_MESSAGE } from '../constants/notificationMessages';

export const SERVICE_HEALTH_STATUS = {
  CHECKING: 'checking',
  OFFLINE: 'offline',
  ONLINE: 'online',
};

export function useServiceHealth() {
  const [serviceHealth, setServiceHealth] = useState({
    errorMessage: null,
    status: SERVICE_HEALTH_STATUS.CHECKING,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadHealth() {
      try {
        const healthResponse = await checkHealth();
        if (!isMounted) {
          return;
        }

        if (healthResponse?.status === 'ok') {
          setServiceHealth({
            errorMessage: null,
            status: SERVICE_HEALTH_STATUS.ONLINE,
          });
          return;
        }

        setServiceHealth({
          errorMessage: 'Cannot connect to the verification service.',
          status: SERVICE_HEALTH_STATUS.OFFLINE,
        });
      } catch (error) {
        if (isMounted) {
          setServiceHealth({
            errorMessage: getHealthErrorMessage(error),
            status: SERVICE_HEALTH_STATUS.OFFLINE,
          });
        }
      }
    }

    loadHealth();

    return () => {
      isMounted = false;
    };
  }, []);

  return serviceHealth;
}

function getHealthErrorMessage(error) {
  if (error.message === 'Failed to fetch') {
    return SERVICE_UNAVAILABLE_MESSAGE;
  }

  return error.message || 'Cannot connect to the verification service.';
}
