import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../api/verificationApi', () => ({
  verifySingleLabel: vi.fn(),
}));

vi.mock('../../utils/resultExport', () => ({
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
  mockObjectUrl,
  queueFilenames,
  render,
  renderVerifiedQueue,
  screen,
  selectQueueLabel,
  successfulVerificationResult,
  VerificationForm,
  verifySingleLabel,
  waitFor,
  within,
} from './VerificationForm.testUtils';

describe('VerificationForm.queue', () => {
  let restoreObjectUrl;

  beforeEach(() => {
    vi.clearAllMocks();
    restoreObjectUrl = null;
  });

  afterEach(() => {
    restoreObjectUrl?.();
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

  it('hides folder paths in the queue and shows preview actions', () => {
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, {
      target: {
        files: [
          makeFolderFile('folder-label.png', 'parent/folder-label.png'),
          makeFile('plain-label.png'),
        ],
      },
    });

    expect(screen.getAllByText('folder-label.png')).toHaveLength(2);
    expect(screen.queryByText('parent/folder-label.png')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/parent\/folder-label\.png/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preview folder-label.png' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preview plain-label.png' })).toBeInTheDocument();
  });

  it('previews a queued label without changing the selected label and closes from Back, outside click, or Escape', () => {
    restoreObjectUrl = mockObjectUrl('blob:label-preview');
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);
    const firstFile = makeFile('first-label.png');
    const secondFile = makeFile('second-label.png');

    fireEvent.change(fileInput, { target: { files: [firstFile, secondFile] } });
    expect(screen.getByText(hasExactText('Editing selected label: first-label.png'))).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Preview second-label.png' }));

    let dialog = screen.getByRole('dialog', { name: 'Preview: second-label.png' });
    expect(URL.createObjectURL).toHaveBeenCalledWith(secondFile);
    expect(within(dialog).getByRole('img', { name: 'Preview of second-label.png' })).toHaveAttribute(
      'src',
      'blob:label-preview',
    );
    expect(screen.getByText(hasExactText('Editing selected label: first-label.png'))).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Back' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:label-preview');
    expect(screen.getByText(hasExactText('Editing selected label: first-label.png'))).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Preview second-label.png' }));
    fireEvent.mouseDown(container.querySelector('.label-preview-dialog-overlay'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Preview second-label.png' }));
    dialog = screen.getByRole('dialog', { name: 'Preview: second-label.png' });
    expect(dialog).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText(hasExactText('Editing selected label: first-label.png'))).toBeInTheDocument();
  });

  it('closes the preview safely when the previewed label leaves the queue', async () => {
    restoreObjectUrl = mockObjectUrl('blob:label-preview');
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, {
      target: { files: [makeFile('first-label.png'), makeFile('second-label.png')] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Preview second-label.png' }));
    expect(screen.getByRole('dialog', { name: 'Preview: second-label.png' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear Labels' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(queueFilenames(container)).toHaveLength(0);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:label-preview');
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
