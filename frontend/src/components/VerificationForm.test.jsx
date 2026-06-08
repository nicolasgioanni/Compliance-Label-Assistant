import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { verifySingleLabel } from '../api/verificationApi';
import { downloadQueueResultsCsv, downloadQueueResultsXlsx } from '../utils/resultExport';
import VerificationForm from './VerificationForm';

vi.mock('../api/verificationApi', () => ({
  verifySingleLabel: vi.fn(),
}));

vi.mock('../utils/resultExport', () => ({
  downloadQueueResultsCsv: vi.fn(),
  downloadQueueResultsXlsx: vi.fn(),
}));

function makeFile(name, type = 'image/png', size = 4) {
  return new File([new Uint8Array(size)], name, { type });
}

function makeFolderFile(name, relativePath, type = 'image/png') {
  const file = makeFile(name, type);
  Object.defineProperty(file, 'webkitRelativePath', {
    configurable: true,
    value: relativePath,
  });
  return file;
}

function fileInputs(container) {
  return container.querySelectorAll('input[type="file"]');
}

function queueFilenames(container) {
  return container.querySelectorAll('.queue-filename');
}

function addBrandName(value) {
  fireEvent.change(screen.getByLabelText(/Brand Name/i), { target: { value } });
}

function hasExactText(text) {
  return (_, node) =>
    node?.textContent === text && Array.from(node.children).every((child) => child.textContent !== text);
}

function successfulVerificationResult(overrides = {}) {
  return {
    overall_status: 'pass',
    processing_time_ms: 42,
    message: 'AI extraction completed and deterministic field verification was applied.',
    field_results: [
      {
        field_name: 'brand_name',
        status: 'pass',
        expected: 'Review Brand',
        found: 'Review Brand',
        reason: 'The brand name matches the selected label.',
        confidence: 0.99,
      },
    ],
    extracted_fields: {
      brand_name: 'Review Brand',
      class_type: 'Whiskey',
      alcohol_content: '40%',
      net_contents: '750 mL',
      government_warning_text: 'GOVERNMENT WARNING',
      raw_text: 'Review Brand Whiskey 40% 750 mL',
    },
    ...overrides,
  };
}

async function renderVerifiedQueue(filename = 'verified-label.png') {
  verifySingleLabel.mockResolvedValueOnce(successfulVerificationResult());
  const showError = vi.fn();
  const rendered = render(<VerificationForm showError={showError} />);
  const [fileInput] = fileInputs(rendered.container);

  fireEvent.change(fileInput, { target: { files: [makeFile(filename)] } });
  addBrandName('Review Brand');
  fireEvent.click(screen.getByRole('button', { name: 'Verify Selected Label' }));

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Export Results' })).not.toBeDisabled();
  });

  return { ...rendered, showError };
}

describe('VerificationForm upload queue behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
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
    expect(screen.queryByText('Expected Application Data')).not.toBeInTheDocument();
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

    const overallStatusGroup = screen.getByText('Overall Status').closest('div');
    const overallStatusValue = within(overallStatusGroup).getByText('Pass');
    expect(overallStatusValue).toHaveClass('status-text', 'status-text-pass');
    expect(overallStatusValue).not.toHaveClass('status-pill');
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

  it('opens the export dialog and routes CSV and Excel downloads', async () => {
    await renderVerifiedQueue();
    const exportButton = screen.getByRole('button', { name: 'Export Results' });

    fireEvent.click(exportButton);
    let dialog = screen.getByRole('dialog', { name: 'Which file type would you like to download?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Download CSV' }));

    expect(downloadQueueResultsCsv).toHaveBeenCalledTimes(1);
    expect(downloadQueueResultsXlsx).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(exportButton);
    dialog = screen.getByRole('dialog', { name: 'Which file type would you like to download?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Download Excel' }));

    expect(downloadQueueResultsXlsx).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the export dialog without downloading from back, outside click, or Escape', async () => {
    const { container } = await renderVerifiedQueue();
    const exportButton = screen.getByRole('button', { name: 'Export Results' });

    fireEvent.click(exportButton);
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(exportButton);
    fireEvent.mouseDown(container.querySelector('.export-dialog-overlay'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(exportButton);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(downloadQueueResultsCsv).not.toHaveBeenCalled();
    expect(downloadQueueResultsXlsx).not.toHaveBeenCalled();
  });
});
