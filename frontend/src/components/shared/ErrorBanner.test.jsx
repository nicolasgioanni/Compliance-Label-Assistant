import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ErrorBanner from './ErrorBanner';

describe('ErrorBanner', () => {
  afterEach(() => {
    cleanup();
  });

  it('uses the error tone by default', () => {
    render(<ErrorBanner message="Something failed." />);

    expect(screen.getByRole('alert')).toHaveClass('error-banner', 'error-banner-error');
  });

  it('supports an info tone with the same dismiss behavior', () => {
    const onDismiss = vi.fn();
    render(<ErrorBanner message="Review result will become stale." tone="info" onDismiss={onDismiss} />);

    expect(screen.getByRole('alert')).toHaveClass('error-banner', 'error-banner-info');

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss error message' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('supports a warning tone with the same dismiss behavior', () => {
    const onDismiss = vi.fn();
    render(
      <ErrorBanner
        message="Changing selected label data will mark the previous verification result stale."
        tone="warning"
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByRole('alert')).toHaveClass('error-banner', 'error-banner-warning');

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss error message' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
