import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkHealth } from './api/verificationApi';
import App from './App';

vi.mock('./api/verificationApi', () => ({
  checkHealth: vi.fn(),
}));

vi.mock('./components/shared/Header', () => ({
  default: () => <header>Header</header>,
}));

vi.mock('./components/shared/AppFooter', () => ({
  default: () => <footer>Footer</footer>,
}));

vi.mock('./components/verification/VerificationForm', () => ({
  default: ({ showError }) => (
    <section>
      <button
        type="button"
        onClick={() =>
          showError('Changing selected label data will mark the previous verification result stale.', {
            tone: 'warning',
          })
        }
      >
        Show edit warning
      </button>
      <button
        type="button"
        onClick={() => showError('Previous verification result is stale. Re-run verification to refresh it.')}
      >
        Show stale error
      </button>
    </section>
  ),
}));

describe('App notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkHealth.mockResolvedValue({ status: 'ok' });
  });

  afterEach(() => {
    cleanup();
  });

  it('replaces the active banner when a newer message is shown', async () => {
    render(<App />);

    await waitFor(() => {
      expect(checkHealth).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Show edit warning' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Changing selected label data will mark the previous verification result stale.',
    );
    expect(screen.getByRole('alert')).toHaveClass('error-banner-warning');

    fireEvent.click(screen.getByRole('button', { name: 'Show stale error' }));

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toHaveTextContent('Previous verification result is stale. Re-run verification to refresh it.');
    expect(alerts[0]).toHaveClass('error-banner-error');
    expect(
      screen.queryByText('Changing selected label data will mark the previous verification result stale.'),
    ).not.toBeInTheDocument();
  });
});
