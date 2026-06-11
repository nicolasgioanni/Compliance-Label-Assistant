import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ResizableLandingPanels from './ResizableLandingPanels';

describe('ResizableLandingPanels', () => {
  afterEach(() => {
    cleanup();
  });

  it('adjusts and clamps the split with pointer dragging', () => {
    render(<ResizableLandingPanels />);

    const split = screen.getByTestId('landing-resizable-panels');
    const separator = screen.getByRole('separator', { name: 'Resize landing page panels' });
    mockSplitBounds(split, { left: 0, width: 1200 });

    fireEvent.pointerDown(separator, { clientX: 800, pointerId: 1 });
    act(() => {
      dispatchPointerMove(960);
    });

    expect(separator).toHaveAttribute('aria-valuenow', '75');
    expect(split).toHaveStyle({ '--landing-left-size': '75%' });

    act(() => {
      dispatchPointerMove(120);
    });

    expect(separator).toHaveAttribute('aria-valuenow', '33.333');
    expect(split).toHaveStyle({ '--landing-left-size': '33.333%' });

    act(() => {
      window.dispatchEvent(new Event('pointerup'));
    });
  });

  it('adjusts the split with keyboard arrows', () => {
    render(<ResizableLandingPanels />);

    const separator = screen.getByRole('separator', { name: 'Resize landing page panels' });

    fireEvent.keyDown(separator, { key: 'ArrowLeft' });

    expect(separator).toHaveAttribute('aria-valuenow', '61.666');

    fireEvent.keyDown(separator, { key: 'ArrowRight' });

    expect(separator).toHaveAttribute('aria-valuenow', '66.666');
  });
});

function mockSplitBounds(element, { left, width }) {
  element.getBoundingClientRect = () => ({
    bottom: 402,
    height: 402,
    left,
    right: left + width,
    top: 0,
    width,
    x: left,
    y: 0,
    toJSON: () => {},
  });
}

function dispatchPointerMove(clientX) {
  const event = new Event('pointermove');
  Object.defineProperty(event, 'clientX', { value: clientX });
  window.dispatchEvent(event);
}
