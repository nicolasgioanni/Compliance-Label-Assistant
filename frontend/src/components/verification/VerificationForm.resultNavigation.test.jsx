import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../api/verificationApi', () => ({
  verifySingleLabel: vi.fn(),
}));

vi.mock('../../utils/resultExport', () => ({
  downloadQueueResultsCsv: vi.fn(),
  downloadQueueResultsXlsx: vi.fn(),
}));
import {
  act,
  addBrandName,
  cleanup,
  fileInputs,
  fireEvent,
  hasExactText,
  makeFile,
  render,
  renderVerifiedQueue,
  screen,
  successfulVerificationResult,
  VerificationForm,
  verifySingleLabel,
  waitFor,
} from './VerificationForm.testUtils';
describe('VerificationForm.resultNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('disables completed-result actions and export while batch verification is still running', async () => {
    const firstVerification = createDeferredVerification();
    const secondVerification = createDeferredVerification();
    verifySingleLabel
      .mockImplementationOnce(() => firstVerification.promise)
      .mockImplementationOnce(() => secondVerification.promise);
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, {
      target: { files: [makeFile('batch-first.png'), makeFile('batch-second.png')] },
    });
    addBrandName('First Brand');
    fireEvent.click(screen.getByRole('button', { name: /Select label batch-second\.png/i }));
    addBrandName('Second Brand');

    fireEvent.click(screen.getByRole('button', { name: 'Verify Ready Labels' }));

    await act(async () => {
      firstVerification.resolve(successfulVerificationResult());
      await firstVerification.promise;
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Select label batch-first\.png, status Pass/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Select label batch-first\.png, status Pass/i }));

    await waitFor(() => {
      expect(screen.getByText(hasExactText('Selected Label: batch-first.png'))).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Edit Selected Label' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Export Results' })).toBeDisabled();

    await act(async () => {
      secondVerification.resolve(successfulVerificationResult());
      await secondVerification.promise;
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit Selected Label' })).not.toBeDisabled();
    });
    expect(screen.getByRole('button', { name: 'Export Results' })).not.toBeDisabled();
    expect(verifySingleLabel).toHaveBeenCalledTimes(2);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('keeps selected label review visible after verification and uses text status metadata', async () => {
    verifySingleLabel.mockResolvedValueOnce(successfulVerificationResult());
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, { target: { files: [makeFile('verified-label.png')] } });
    addBrandName('Review Brand');
    fireEvent.click(screen.getByRole('button', { name: 'Verify Selected Label' }));

    await waitFor(() => {
      expect(screen.getByText(hasExactText('Selected Label: verified-label.png'))).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Selected Label Review' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Selected Label' })).toBeInTheDocument();
    expect(screen.queryByText(/AI extraction completed/i)).not.toBeInTheDocument();

    const resultHeader = container.querySelector('.result-detail-header');
    expect(resultHeader.querySelector('.status-pill')).toBeNull();

    expect(Array.from(container.querySelectorAll('.result-meta-grid dt')).map((node) => node.textContent)).toEqual([
      'Overall Status',
      'Processing Time',
    ]);

    expect(screen.getByText('Overall Status').nextElementSibling).toHaveClass('status-text', 'status-text-pass');
    expect(screen.getByText('Overall Status').nextElementSibling).not.toHaveClass('status-pill');
  });

  it('returns from selected label editing to current results without re-verification', async () => {
    const { showError } = await renderVerifiedQueue('back-to-results-label.png');
    showError.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'Edit Selected Label' }));

    expect(showError).toHaveBeenCalledWith(
      'Changing selected label data will mark the previous verification result stale.',
      { tone: 'warning' },
    );
    expect(screen.getByText(hasExactText('Editing selected label: back-to-results-label.png'))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to Results' })).toHaveClass(
      'secondary-button',
      'export-dialog-back-button',
    );
    expect(screen.queryByText('Changing selected label data will mark the previous verification result stale.')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back to Results' }));

    expect(screen.getByText(hasExactText('Selected Label: back-to-results-label.png'))).toBeInTheDocument();
    expect(screen.getByText('Overall Status')).toBeInTheDocument();
    expect(verifySingleLabel).toHaveBeenCalledTimes(1);
  });

  it('moves stale verification messaging to the main error banner path after expected data changes', async () => {
    const { showError } = await renderVerifiedQueue('stale-message-label.png');

    fireEvent.click(screen.getByRole('button', { name: 'Edit Selected Label' }));
    showError.mockClear();
    fireEvent.change(screen.getByLabelText(/Brand Name/i), { target: { value: 'Changed Review Brand' } });

    expect(showError).toHaveBeenCalledWith('Previous verification result is stale. Re-run verification to refresh it.');
    expect(
      screen.queryByText('Previous verification result is stale. Re-run verification to refresh it.'),
    ).not.toBeInTheDocument();

    showError.mockClear();
    fireEvent.change(screen.getByLabelText(/Brand Name/i), { target: { value: 'Changed Review Brand Again' } });

    expect(showError).not.toHaveBeenCalledWith(
      'Previous verification result is stale. Re-run verification to refresh it.',
    );
  });
});

function createDeferredVerification() {
  let resolve;
  const promise = new Promise((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}
