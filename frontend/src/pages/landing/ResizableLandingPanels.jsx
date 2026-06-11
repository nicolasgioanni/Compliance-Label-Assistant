import { useCallback, useRef, useState } from 'react';
import LandingActionPanel from './LandingActionPanel';
import LandingInfoPanel from './LandingInfoPanel';

const DEFAULT_LEFT_SIZE = 66.666;
const KEYBOARD_STEP = 5;
const MAX_LEFT_SIZE = 75;
const MIN_LEFT_SIZE = 33.333;

export default function ResizableLandingPanels() {
  const [leftSize, setLeftSize] = useState(DEFAULT_LEFT_SIZE);
  const splitRef = useRef(null);

  const updateLeftSize = useCallback((nextSize) => {
    setLeftSize(clampLeftSize(nextSize));
  }, []);

  const handleDividerPointerDown = useCallback(
    (event) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture?.(event.pointerId);

      function handlePointerMove(moveEvent) {
        const splitBounds = splitRef.current?.getBoundingClientRect();
        if (!splitBounds?.width || !Number.isFinite(moveEvent.clientX)) {
          return;
        }

        const nextSize = ((moveEvent.clientX - splitBounds.left) / splitBounds.width) * 100;
        updateLeftSize(nextSize);
      }

      function handlePointerUp() {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      }

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp, { once: true });
    },
    [updateLeftSize],
  );

  const handleDividerKeyDown = useCallback(
    (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        updateLeftSize(leftSize - KEYBOARD_STEP);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        updateLeftSize(leftSize + KEYBOARD_STEP);
      }
    },
    [leftSize, updateLeftSize],
  );

  return (
    <section
      className="landing-resizable-panels"
      data-testid="landing-resizable-panels"
      ref={splitRef}
      style={{ '--landing-left-size': `${formatSize(leftSize)}%` }}
    >
      <LandingInfoPanel />
      <div
        aria-label="Resize landing page panels"
        aria-orientation="vertical"
        aria-valuemax={MAX_LEFT_SIZE}
        aria-valuemin={MIN_LEFT_SIZE}
        aria-valuenow={Number(formatSize(leftSize))}
        className="landing-resize-handle"
        role="separator"
        tabIndex="0"
        onKeyDown={handleDividerKeyDown}
        onPointerDown={handleDividerPointerDown}
      />
      <LandingActionPanel />
    </section>
  );
}

function clampLeftSize(size) {
  return Math.min(MAX_LEFT_SIZE, Math.max(MIN_LEFT_SIZE, size));
}

function formatSize(size) {
  return size.toFixed(3).replace(/\.?0+$/, '');
}
