import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import VerificationForm from './VerificationForm';

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

describe('VerificationForm upload queue behavior', () => {
  it('queues only valid unique files and reports combined upload warnings', () => {
    const showError = vi.fn();
    const { container } = render(<VerificationForm showError={showError} />);
    const [fileInput] = fileInputs(container);
    const validFile = makeFile('new-label.png');
    const duplicateFile = makeFolderFile('new-label.png', 'images/new-label.png');
    const invalidFile = makeFile('bad.svg', 'image/svg+xml');

    fireEvent.change(fileInput, { target: { files: [validFile, duplicateFile, invalidFile] } });

    expect(container.querySelectorAll('.queue-filename')).toHaveLength(1);
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

    expect(container.querySelectorAll('.queue-filename')).toHaveLength(1);
    expect(showError).toHaveBeenCalledWith('No label images were added. Skipped 1 duplicate file.');
  });
});
