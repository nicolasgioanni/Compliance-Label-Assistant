import { useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const VIEWPORT_PADDING = 16;
const TOOLTIP_GAP = 10;
const ARROW_EDGE_PADDING = 12;

export default function InfoTooltip({ label, children }) {
  const tooltipId = useId();
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const portalRoot = typeof document === 'undefined' ? null : document.body;
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({
    arrowLeft: 0,
    left: 0,
    placement: 'bottom',
    top: 0,
  });

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || !tooltipRef.current) {
      return undefined;
    }

    function updatePosition() {
      if (!triggerRef.current || !tooltipRef.current) {
        return;
      }

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const triggerCenter = triggerRect.left + triggerRect.width / 2;
      const bottomTop = triggerRect.bottom + TOOLTIP_GAP;
      const topTop = triggerRect.top - tooltipRect.height - TOOLTIP_GAP;
      const availableBelow = viewportHeight - triggerRect.bottom - VIEWPORT_PADDING;
      const availableAbove = triggerRect.top - VIEWPORT_PADDING;
      const placement =
        bottomTop + tooltipRect.height > viewportHeight - VIEWPORT_PADDING && availableAbove > availableBelow
          ? 'top'
          : 'bottom';
      const rawTop = placement === 'top' ? topTop : bottomTop;
      const rawLeft = triggerCenter - tooltipRect.width / 2;
      const maxLeft = viewportWidth - tooltipRect.width - VIEWPORT_PADDING;
      const left = Math.min(Math.max(rawLeft, VIEWPORT_PADDING), Math.max(VIEWPORT_PADDING, maxLeft));
      const maxTop = viewportHeight - tooltipRect.height - VIEWPORT_PADDING;
      const top = Math.min(Math.max(rawTop, VIEWPORT_PADDING), Math.max(VIEWPORT_PADDING, maxTop));
      const arrowLeft = Math.min(
        Math.max(triggerCenter - left, ARROW_EDGE_PADDING),
        Math.max(ARROW_EDGE_PADDING, tooltipRect.width - ARROW_EDGE_PADDING),
      );

      setPosition({ arrowLeft, left, placement, top });
    }

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  return (
    <span className="info-tooltip" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button
        aria-describedby={isOpen ? tooltipId : undefined}
        aria-label={label}
        className="info-tooltip-trigger"
        ref={triggerRef}
        type="button"
        onBlur={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
      >
        i
      </button>
      {isOpen && portalRoot
        ? createPortal(
            <span
              className={`info-tooltip-content info-tooltip-content-visible info-tooltip-content-${position.placement}`}
              id={tooltipId}
              ref={tooltipRef}
              role="tooltip"
              style={{
                '--info-tooltip-arrow-left': `${position.arrowLeft}px`,
                left: `${position.left}px`,
                top: `${position.top}px`,
              }}
            >
              {children}
            </span>,
            portalRoot,
          )
        : null}
    </span>
  );
}
