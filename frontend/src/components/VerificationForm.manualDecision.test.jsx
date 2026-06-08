import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/verificationApi', () => ({
  verifySingleLabel: vi.fn(),
}));

vi.mock('../utils/resultExport', () => ({
  downloadQueueResultsCsv: vi.fn(),
  downloadQueueResultsXlsx: vi.fn(),
}));
import {
  addBrandName,
  cleanup,
  fileInputs,
  fireEvent,
  getQueueSummaryValue,
  getResultMetaValue,
  makeFile,
  render,
  renderVerifiedQueue,
  screen,
  successfulVerificationResult,
  VerificationForm,
  verifySingleLabel,
  waitFor,
  within,
} from './VerificationForm.testUtils';
describe('VerificationForm.manualDecision', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('closes the human review dialog without applying changes from Back, outside click, or Escape', async () => {
    const { container } = await renderVerifiedQueue();

    fireEvent.click(screen.getByRole('button', { name: 'Edit Final Decision' }));
    let dialog = screen.getByRole('dialog', { name: 'Set Human Review Decision' });
    fireEvent.click(within(dialog).getByRole('radio', { name: 'Fail' }));
    fireEvent.change(within(dialog).getByPlaceholderText('Optional note for the manual decision'), {
      target: { value: 'Do not save this note.' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Back' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getResultMetaValue('Final Decision', 'Pass')).toBeInTheDocument();
    expect(screen.queryByText('Manual decision applied')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit Final Decision' }));
    fireEvent.mouseDown(container.querySelector('.human-review-dialog-overlay'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit Final Decision' }));
    dialog = screen.getByRole('dialog', { name: 'Set Human Review Decision' });
    fireEvent.click(within(dialog).getByRole('radio', { name: 'Fail' }));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getResultMetaValue('Final Decision', 'Pass')).toBeInTheDocument();
  });

  it('applies and clears a human final decision across selected review, queue badge, and summary counts', async () => {
    verifySingleLabel.mockResolvedValueOnce(successfulVerificationResult({ overall_status: 'fail' }));
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, { target: { files: [makeFile('manual-label.png')] } });
    addBrandName('Review Brand');
    fireEvent.click(screen.getByRole('button', { name: 'Verify Selected Label' }));

    await waitFor(() => {
      expect(getResultMetaValue('Final Decision', 'Fail')).toBeInTheDocument();
    });

    expect(getResultMetaValue('Automated Status', 'Fail')).toBeInTheDocument();
    expect(getQueueSummaryValue('Passed')).toBe('0');
    expect(getQueueSummaryValue('Failed')).toBe('1');

    fireEvent.click(screen.getByRole('button', { name: 'Edit Final Decision' }));
    const dialog = screen.getByRole('dialog', { name: 'Set Human Review Decision' });
    fireEvent.click(within(dialog).getByRole('radio', { name: 'Pass' }));
    fireEvent.change(within(dialog).getByPlaceholderText('Optional note for the manual decision'), {
      target: { value: ' Reviewer confirmed label is acceptable. ' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Apply Decision' }));

    expect(getResultMetaValue('Automated Status', 'Fail')).toBeInTheDocument();
    expect(getResultMetaValue('Final Decision', 'Pass')).toBeInTheDocument();
    expect(screen.queryByText('Manual decision applied')).not.toBeInTheDocument();
    expect(screen.queryByText('Reviewer confirmed label is acceptable.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Selected label manual-label\.png, status Pass/i })).toBeInTheDocument();
    expect(getQueueSummaryValue('Passed')).toBe('1');
    expect(getQueueSummaryValue('Failed')).toBe('0');
    expect(screen.getByText('Manual decisions: 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit Selected Label' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to Results' }));

    expect(getResultMetaValue('Final Decision', 'Pass')).toBeInTheDocument();
    expect(screen.getByText('Manual decisions: 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit Final Decision' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear Manual Decision' }));

    expect(getResultMetaValue('Final Decision', 'Fail')).toBeInTheDocument();
    expect(screen.queryByText('Manual decision applied')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Selected label manual-label\.png, status Fail/i })).toBeInTheDocument();
    expect(getQueueSummaryValue('Passed')).toBe('0');
    expect(getQueueSummaryValue('Failed')).toBe('1');
    expect(screen.queryByText('Manual decisions: 1')).not.toBeInTheDocument();
  });

  it('clears manual decisions after re-verification and expected-field edits', async () => {
    verifySingleLabel
      .mockResolvedValueOnce(successfulVerificationResult({ overall_status: 'fail' }))
      .mockResolvedValueOnce(successfulVerificationResult({ overall_status: 'needs_review' }));
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, { target: { files: [makeFile('stale-manual-label.png')] } });
    addBrandName('Review Brand');
    fireEvent.click(screen.getByRole('button', { name: 'Verify Selected Label' }));

    await waitFor(() => {
      expect(getResultMetaValue('Final Decision', 'Fail')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Edit Final Decision' }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Set Human Review Decision' })).getByRole('radio', { name: 'Pass' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply Decision' }));

    expect(screen.queryByText('Manual decision applied')).not.toBeInTheDocument();
    expect(getResultMetaValue('Final Decision', 'Pass')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Verify Selected Label' }));

    await waitFor(() => {
      expect(getResultMetaValue('Final Decision', 'Needs Review')).toBeInTheDocument();
    });

    expect(screen.queryByText('Manual decision applied')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit Final Decision' }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Set Human Review Decision' })).getByRole('radio', { name: 'Pass' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply Decision' }));
    expect(screen.queryByText('Manual decision applied')).not.toBeInTheDocument();
    expect(getResultMetaValue('Final Decision', 'Pass')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit Selected Label' }));
    expect(screen.getByRole('button', { name: 'Back to Results' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Brand Name/i), { target: { value: 'Updated Brand' } });

    expect(screen.queryByText('Manual decision applied')).not.toBeInTheDocument();
    expect(screen.queryByText('Verify this label before setting a final decision.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Back to Results' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export Results' })).toBeDisabled();
  });
});
