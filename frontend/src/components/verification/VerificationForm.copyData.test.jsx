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
  screen,
  selectQueueLabel,
  successfulVerificationResult,
  VerificationForm,
  verifySingleLabel,
  waitFor,
  within,
} from './VerificationForm.testUtils';
describe('VerificationForm.copyData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('opens and closes the copy dialog without changing data from Back, outside click, or Escape', () => {
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, {
      target: { files: [makeFile('first-label.png'), makeFile('second-label.png')] },
    });
    addBrandName('Source Brand');

    fireEvent.click(screen.getByRole('button', { name: 'Copy Claim Data' }));
    expect(screen.getByRole('dialog', { name: 'Copy Expected Data to Labels' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Copy Claim Data' }));
    fireEvent.mouseDown(container.querySelector('.copy-data-dialog-overlay'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Copy Claim Data' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    selectQueueLabel('second-label.png');
    expect(screen.getByLabelText(/Brand Name/i)).toHaveValue('');
  });

  it('supports selecting and clearing copy targets', () => {
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, {
      target: { files: [makeFile('first-label.png'), makeFile('second-label.png'), makeFile('third-label.png')] },
    });
    addBrandName('Shared Brand');
    fireEvent.click(screen.getByRole('button', { name: 'Copy Claim Data' }));

    const dialog = screen.getByRole('dialog', { name: 'Copy Expected Data to Labels' });
    expect(within(dialog).getByRole('button', { name: 'About copying expected data' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'About the source label' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'About target labels' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'About clearing source data' })).toBeInTheDocument();
    const secondTarget = within(dialog).getByRole('checkbox', { name: /second-label\.png/i });
    const thirdTarget = within(dialog).getByRole('checkbox', { name: /third-label\.png/i });
    const secondTargetRow = secondTarget.closest('label');
    const thirdTargetRow = thirdTarget.closest('label');
    const applyButton = within(dialog).getByRole('button', { name: 'Apply to Selected Labels' });

    expect(secondTarget).not.toBeChecked();
    expect(thirdTarget).not.toBeChecked();
    expect(secondTargetRow).not.toHaveClass('copy-data-row-selected');
    expect(thirdTargetRow).not.toHaveClass('copy-data-row-selected');
    expect(applyButton).toBeDisabled();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Select All' }));

    expect(secondTarget).toBeChecked();
    expect(thirdTarget).toBeChecked();
    expect(secondTargetRow).toHaveClass('copy-data-row-selected');
    expect(thirdTargetRow).toHaveClass('copy-data-row-selected');
    expect(applyButton).not.toBeDisabled();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Clear Selection' }));

    expect(secondTarget).not.toBeChecked();
    expect(thirdTarget).not.toBeChecked();
    expect(secondTargetRow).not.toHaveClass('copy-data-row-selected');
    expect(thirdTargetRow).not.toHaveClass('copy-data-row-selected');
    expect(applyButton).toBeDisabled();
  });

  it('copies expected data to selected target labels only', () => {
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, {
      target: { files: [makeFile('first-label.png'), makeFile('second-label.png'), makeFile('third-label.png')] },
    });
    addBrandName('Shared Brand');
    fireEvent.change(screen.getByLabelText(/Class \/ Type Designation/i), { target: { value: 'Whiskey' } });
    fireEvent.click(screen.getByRole('button', { name: 'Copy Claim Data' }));

    const dialog = screen.getByRole('dialog', { name: 'Copy Expected Data to Labels' });
    fireEvent.click(within(dialog).getByRole('checkbox', { name: /second-label\.png/i }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Apply to Selected Labels' }));

    selectQueueLabel('second-label.png');
    expect(screen.getByLabelText(/Brand Name/i)).toHaveValue('Shared Brand');
    expect(screen.getByLabelText(/Class \/ Type Designation/i)).toHaveValue('Whiskey');

    selectQueueLabel('third-label.png');
    expect(screen.getByLabelText(/Brand Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Class \/ Type Designation/i)).toHaveValue('');
  });

  it('does not show the old missing-data modal warning after requiring source brand before opening', () => {
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, {
      target: { files: [makeFile('first-label.png'), makeFile('second-label.png')] },
    });

    const copyClaimDataButton = screen.getByRole('button', { name: 'Copy Claim Data' });
    expect(copyClaimDataButton).toBeDisabled();
    expect(copyClaimDataButton).toHaveAttribute('title', 'Enter a brand name before copying.');

    addBrandName('Source Brand');
    fireEvent.click(screen.getByRole('button', { name: 'Copy Claim Data' }));

    const dialog = screen.getByRole('dialog', { name: 'Copy Expected Data to Labels' });
    fireEvent.click(within(dialog).getByRole('checkbox', { name: /second-label\.png/i }));

    expect(within(dialog).queryByText('Enter expected application data before copying.')).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Apply to Selected Labels' })).not.toBeDisabled();
  });

  it('shows and dismisses the blank-field overlay warning in the copy dialog', () => {
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, {
      target: { files: [makeFile('first-label.png'), makeFile('second-label.png')] },
    });
    addBrandName('Source Brand');
    fireEvent.click(screen.getByRole('button', { name: 'Copy Claim Data' }));

    const dialog = screen.getByRole('dialog', { name: 'Copy Expected Data to Labels' });
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Blank fields will also be copied.');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Dismiss blank field warning' }));

    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument();
  });

  it('auto-dismisses the blank-field overlay warning after 10 seconds', () => {
    vi.useFakeTimers();
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, {
      target: { files: [makeFile('first-label.png'), makeFile('second-label.png')] },
    });
    addBrandName('Source Brand');
    fireEvent.click(screen.getByRole('button', { name: 'Copy Claim Data' }));

    const dialog = screen.getByRole('dialog', { name: 'Copy Expected Data to Labels' });
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Blank fields will also be copied.');

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument();
  });

  it('clears a target verification result when copied expected data overwrites it', async () => {
    verifySingleLabel.mockResolvedValueOnce(successfulVerificationResult());
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, {
      target: { files: [makeFile('source-label.png'), makeFile('verified-target.png')] },
    });
    selectQueueLabel('verified-target.png');
    addBrandName('Review Brand');
    fireEvent.click(screen.getByRole('button', { name: 'Verify Selected Label' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export Results' })).not.toBeDisabled();
    });

    selectQueueLabel('source-label.png');
    addBrandName('Replacement Brand');
    fireEvent.click(screen.getByRole('button', { name: 'Copy Claim Data' }));

    const dialog = screen.getByRole('dialog', { name: 'Copy Expected Data to Labels' });
    expect(within(dialog).getByText('Verified result will be cleared if overwritten')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('checkbox', { name: /verified-target\.png/i }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Apply to Selected Labels' }));

    expect(screen.getByRole('button', { name: 'Export Results' })).toBeDisabled();
    selectQueueLabel('verified-target.png');
    expect(screen.getByLabelText(/Brand Name/i)).toHaveValue('Replacement Brand');
    expect(screen.queryByText(hasExactText('Selected Label: verified-target.png'))).not.toBeInTheDocument();
  });

  it('clears source data only when the move option is explicitly selected', () => {
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, {
      target: { files: [makeFile('first-label.png'), makeFile('second-label.png')] },
    });
    addBrandName('Moved Brand');
    fireEvent.click(screen.getByRole('button', { name: 'Copy Claim Data' }));

    const dialog = screen.getByRole('dialog', { name: 'Copy Expected Data to Labels' });
    fireEvent.click(within(dialog).getByRole('checkbox', { name: /second-label\.png/i }));
    fireEvent.click(within(dialog).getByRole('checkbox', { name: 'Clear data from source label after applying' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Apply to Selected Labels' }));

    expect(screen.getByLabelText(/Brand Name/i)).toHaveValue('');

    selectQueueLabel('second-label.png');
    expect(screen.getByLabelText(/Brand Name/i)).toHaveValue('Moved Brand');
  });

  it('allows clearing only the source when the move option is selected', () => {
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, {
      target: { files: [makeFile('first-label.png'), makeFile('second-label.png')] },
    });
    addBrandName('Wrong File Brand');
    fireEvent.click(screen.getByRole('button', { name: 'Copy Claim Data' }));

    const dialog = screen.getByRole('dialog', { name: 'Copy Expected Data to Labels' });
    fireEvent.click(within(dialog).getByRole('checkbox', { name: 'Clear data from source label after applying' }));

    const clearSourceButton = within(dialog).getByRole('button', { name: 'Clear Source Data' });
    expect(clearSourceButton).not.toBeDisabled();
    fireEvent.click(clearSourceButton);

    expect(screen.getByLabelText(/Brand Name/i)).toHaveValue('');
  });
});
