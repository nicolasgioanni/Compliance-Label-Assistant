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
  hasExactText,
  makeFile,
  makeFolderFile,
  queueFilenames,
  render,
  renderVerifiedQueue,
  screen,
  selectQueueLabel,
  successfulVerificationResult,
  VerificationForm,
  verifySingleLabel,
  waitFor,
} from './VerificationForm.testUtils';
describe('VerificationForm.queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('queues only valid unique files and reports combined upload warnings', () => {
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);
    const validFile = makeFile('new-label.png');
    const duplicateFile = makeFolderFile('new-label.png', 'images/new-label.png');
    const invalidFile = makeFile('bad.svg', 'image/svg+xml');

    fireEvent.change(fileInput, { target: { files: [validFile, duplicateFile, invalidFile] } });

    expect(queueFilenames(container)).toHaveLength(1);
    expect(screen.getAllByText('new-label.png')).toHaveLength(2);
    expect(screen.queryByText('bad.svg')).not.toBeInTheDocument();
    expect(showError).toHaveBeenCalledWith(
      'Added 1 label image. Skipped 1 unsupported or oversized file. Skipped 1 duplicate file.',
    );
  });

  it('rejects a folder upload whose basename already exists from Add Files', () => {
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput, folderInput] = fileInputs(container);
    const singleFile = makeFile('tc01_valid_bourbon.png');
    const folderDuplicate = makeFolderFile('tc01_valid_bourbon.png', 'images/tc01_valid_bourbon.png');

    fireEvent.change(fileInput, { target: { files: [singleFile] } });
    showError.mockClear();
    fireEvent.change(folderInput, { target: { files: [folderDuplicate] } });

    expect(queueFilenames(container)).toHaveLength(1);
    expect(showError).toHaveBeenCalledWith('No label images were added. Skipped 1 duplicate file.');
  });

  it('defaults all queue status filters on and toggles Needs Review visibility', () => {
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, { target: { files: [makeFile('filter-label.png')] } });

    const needsWorkFilter = screen.getByRole('button', { name: 'Needs Review' });
    const passFilter = screen.getByRole('button', { name: 'Pass' });
    const failFilter = screen.getByRole('button', { name: 'Fail' });

    expect(needsWorkFilter).toHaveAttribute('aria-pressed', 'true');
    expect(passFilter).toHaveAttribute('aria-pressed', 'true');
    expect(failFilter).toHaveAttribute('aria-pressed', 'true');
    expect(queueFilenames(container)).toHaveLength(1);

    fireEvent.click(needsWorkFilter);

    expect(needsWorkFilter).toHaveAttribute('aria-pressed', 'false');
    expect(queueFilenames(container)).toHaveLength(0);
    expect(screen.getByText('No labels match the selected filters.')).toBeInTheDocument();

    fireEvent.click(needsWorkFilter);

    expect(needsWorkFilter).toHaveAttribute('aria-pressed', 'true');
    expect(queueFilenames(container)).toHaveLength(1);
  });

  it('shows the filtered empty state when all filters are off', () => {
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, { target: { files: [makeFile('all-off-label.png')] } });

    fireEvent.click(screen.getByRole('button', { name: 'Needs Review' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pass' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fail' }));

    expect(queueFilenames(container)).toHaveLength(0);
    expect(screen.getByText('No labels match the selected filters.')).toBeInTheDocument();
  });

  it('shows selected label review copy in the empty and edit states', () => {
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    expect(screen.getByRole('heading', { name: 'Selected Label Review' })).toBeInTheDocument();
    expect(screen.getByText('Add a label image to start a selected label review.')).toBeInTheDocument();
    expect(screen.queryByText('Expected Application Data')).not.toBeInTheDocument();

    fireEvent.change(fileInput, { target: { files: [makeFile('edit-label.png')] } });

    expect(screen.getByRole('heading', { name: 'Selected Label Review' })).toBeInTheDocument();
    expect(screen.getByText(hasExactText('Editing selected label: edit-label.png'))).toBeInTheDocument();
    expect(screen.queryByText('Verify this label before setting a final decision.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit Final Decision' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Back to Results' })).not.toBeInTheDocument();
    expect(screen.queryByText('Expected Application Data')).not.toBeInTheDocument();
  });

  it('enables Copy Claim Data only when another label is queued and source brand is filled', () => {
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, { target: { files: [makeFile('first-label.png')] } });

    const copyClaimDataButton = screen.getByRole('button', { name: 'Copy Claim Data' });
    expect(copyClaimDataButton).toBeDisabled();
    expect(copyClaimDataButton).toHaveClass('primary-button');
    expect(copyClaimDataButton).toHaveAttribute('title', 'Add another label to copy data.');

    fireEvent.change(fileInput, {
      target: { files: [makeFile('second-label.png')] },
    });

    expect(copyClaimDataButton).toBeDisabled();
    expect(copyClaimDataButton).toHaveAttribute('title', 'Enter a brand name before copying.');

    addBrandName('Source Brand');

    expect(copyClaimDataButton).not.toBeDisabled();
    expect(copyClaimDataButton).toHaveClass('primary-button');
    expect(screen.queryByRole('button', { name: 'Apply Current Data to All Labels' })).not.toBeInTheDocument();
  });

  it('uses selected label review copy in the verification error state', async () => {
    verifySingleLabel.mockRejectedValueOnce(new Error('Verification failed.'));
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, { target: { files: [makeFile('error-label.png')] } });
    addBrandName('Review Brand');
    fireEvent.click(screen.getByRole('button', { name: 'Verify Selected Label' }));

    await waitFor(() => {
      expect(screen.getByText(hasExactText('File claim: error-label.png'))).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Selected Label Review' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Selected Label' })).toBeInTheDocument();
    expect(screen.getByText('Verification failed.')).toBeInTheDocument();
  });

  it('disables queue status filters while verification is in progress', () => {
    verifySingleLabel.mockImplementation(() => new Promise(() => {}));
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, { target: { files: [makeFile('pending-label.png')] } });
    addBrandName('Pending Brand');
    fireEvent.click(screen.getByRole('button', { name: 'Verify Selected Label' }));

    expect(screen.getByText('Verifying')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Needs Review' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Pass' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Fail' })).toBeDisabled();
    expect(queueFilenames(container)).toHaveLength(1);
  });

  it('keeps export results disabled until a current verification result exists', () => {
    const showError = vi.fn();
    render(<VerificationForm showError={showError} />);

    const exportButton = screen.getByRole('button', { name: 'Export Results' });
    expect(exportButton).toBeDisabled();
    expect(exportButton).toHaveClass('secondary-button');
  });

  it('uses primary styling for enabled export results', async () => {
    await renderVerifiedQueue();

    const exportButton = screen.getByRole('button', { name: 'Export Results' });
    expect(exportButton).not.toBeDisabled();
    expect(exportButton).toHaveClass('primary-button');
  });
});
