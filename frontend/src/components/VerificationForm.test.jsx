import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { verifySingleLabel } from '../api/verificationApi';
import VerificationForm from './VerificationForm';

vi.mock('../api/verificationApi', () => ({
  verifySingleLabel: vi.fn(),
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

  it('defaults all queue status filters on and toggles Needs Work visibility', () => {
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);

    fireEvent.change(fileInput, { target: { files: [makeFile('filter-label.png')] } });

    const needsWorkFilter = screen.getByRole('button', { name: 'Needs Work' });
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

    fireEvent.click(screen.getByRole('button', { name: 'Needs Work' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pass' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fail' }));

    expect(queueFilenames(container)).toHaveLength(0);
    expect(screen.getByText('No labels match the selected filters.')).toBeInTheDocument();
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
    expect(screen.getByRole('button', { name: 'Needs Work' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Pass' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Fail' })).toBeDisabled();
    expect(queueFilenames(container)).toHaveLength(1);
  });
});
