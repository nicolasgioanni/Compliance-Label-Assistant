// Shared modal-dismissal behavior for Escape, outside click, and body scroll lock.
import { useEffect } from 'react';

let activeDialogCount = 0;
let previousBodyOverflow;

export function useDismissibleDialog(onClose) {
  useEffect(() => {
    const unlockBodyScroll = lockBodyScroll();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      unlockBodyScroll();
    };
  }, [onClose]);

  function handleOverlayMouseDown(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return { handleOverlayMouseDown };
}

function lockBodyScroll() {
  if (typeof document === 'undefined') {
    return () => {};
  }

  if (activeDialogCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  activeDialogCount += 1;

  return () => {
    activeDialogCount = Math.max(0, activeDialogCount - 1);

    if (activeDialogCount === 0) {
      document.body.style.overflow = previousBodyOverflow || '';
      previousBodyOverflow = undefined;
    }
  };
}
