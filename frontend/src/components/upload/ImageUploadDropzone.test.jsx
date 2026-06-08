import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FILE_INPUT_ACCEPT } from '../../utils/fileValidation';
import ImageUploadDropzone from './ImageUploadDropzone';

function makeFile(name, type = 'image/png') {
  return new File(['x'], name, { type });
}

describe('ImageUploadDropzone', () => {
  it('renders Add Files and Add Folder controls with matching accept filters', () => {
    const { container } = render(
      <ImageUploadDropzone
        disabled={false}
        isFolderUploadSupported
        maxQueueSize={10}
        onFilesAdded={() => {}}
      />,
    );
    const view = within(container);

    expect(view.getByRole('button', { name: 'Add Files' })).toBeEnabled();
    expect(view.getByRole('button', { name: 'Add Folder' })).toBeEnabled();

    const inputs = container.querySelectorAll('input[type="file"]');
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveAttribute('accept', FILE_INPUT_ACCEPT);
    expect(inputs[0]).toHaveAttribute('multiple');
    expect(inputs[0]).not.toHaveAttribute('webkitdirectory');
    expect(inputs[1]).toHaveAttribute('accept', FILE_INPUT_ACCEPT);
    expect(inputs[1]).toHaveAttribute('multiple');
    expect(inputs[1]).toHaveAttribute('directory');
    expect(inputs[1]).toHaveAttribute('webkitdirectory');
  });

  it('keeps file upload available when folder upload is not supported', () => {
    const { container } = render(
      <ImageUploadDropzone
        disabled={false}
        isFolderUploadSupported={false}
        maxQueueSize={10}
        onFilesAdded={() => {}}
      />,
    );
    const view = within(container);

    expect(view.getByRole('button', { name: 'Add Files' })).toBeEnabled();
    expect(view.getByRole('button', { name: 'Add Folder unavailable' })).toBeDisabled();
    expect(view.getByText('Folder upload is not supported in this browser. Use Add Files instead.')).toBeInTheDocument();

    const inputs = container.querySelectorAll('input[type="file"]');
    expect(inputs[0]).not.toBeDisabled();
    expect(inputs[1]).toBeDisabled();
    expect(inputs[1]).toHaveAttribute('directory');
    expect(inputs[1]).toHaveAttribute('webkitdirectory');
  });

  it('sends selected files to the caller', () => {
    const onFilesAdded = vi.fn();
    const { container } = render(
      <ImageUploadDropzone disabled={false} maxQueueSize={10} onFilesAdded={onFilesAdded} />,
    );
    const fileInput = container.querySelector('input[type="file"]');
    const file = makeFile('label.png');

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onFilesAdded).toHaveBeenCalledWith([file]);
  });
});
