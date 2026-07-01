// Dialog portal wrapper shared by modal-style overlays.
import BodyPortal from '../shared/BodyPortal';

export default function DialogPortal({ children }) {
  return <BodyPortal>{children}</BodyPortal>;
}
