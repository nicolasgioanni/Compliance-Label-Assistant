// Browser-only portal helper for overlays that should escape route containers.
import { createPortal } from 'react-dom';

export default function BodyPortal({ children }) {
  const portalRoot = typeof document === 'undefined' ? null : document.body;

  return portalRoot ? createPortal(children, portalRoot) : null;
}
