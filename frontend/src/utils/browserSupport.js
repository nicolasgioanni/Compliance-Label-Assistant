// Feature detection for optional directory upload controls.
export function supportsDirectoryUpload(input = createFileInput()) {
  return Boolean(input && ('webkitdirectory' in input || 'directory' in input));
}

function createFileInput() {
  if (typeof document === 'undefined') {
    return null;
  }

  const input = document.createElement('input');
  input.type = 'file';
  return input;
}
