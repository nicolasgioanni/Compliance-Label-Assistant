const SUPPORTED_IMAGE_DESCRIPTION = 'JPG, PNG, WebP, or TIFF';
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/tiff']);
const ACCEPTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);
const MIME_TYPES_BY_EXTENSION = {
  '.jpg': new Set(['image/jpeg']),
  '.jpeg': new Set(['image/jpeg']),
  '.png': new Set(['image/png']),
  '.webp': new Set(['image/webp']),
  '.tif': new Set(['image/tiff']),
  '.tiff': new Set(['image/tiff']),
};
const FILE_INPUT_ACCEPT = '.jpg,.jpeg,.png,.webp,.tif,.tiff,image/jpeg,image/png,image/webp,image/tiff';
const MAX_FILE_SIZE_MB = 5;
const MAX_QUEUE_FILES = 10;

export function validateSingleFile(file) {
  if (!file) {
    return 'Please select one label image.';
  }

  if (!isAcceptedImageFile(file)) {
    return `Please upload a ${SUPPORTED_IMAGE_DESCRIPTION} image.`;
  }

  const sizeInMb = file.size / (1024 * 1024);
  if (sizeInMb > MAX_FILE_SIZE_MB) {
    return `Please upload an image smaller than ${MAX_FILE_SIZE_MB} MB.`;
  }

  return '';
}

export function normalizeFilename(filename) {
  return getCanonicalUploadFilename(filename).toLowerCase();
}

export function getCanonicalUploadFilename(filename) {
  const trimmedFilename = (filename || '').trim();
  const lastSlashIndex = Math.max(trimmedFilename.lastIndexOf('/'), trimmedFilename.lastIndexOf('\\'));

  if (lastSlashIndex < 0) {
    return trimmedFilename;
  }

  return trimmedFilename.slice(lastSlashIndex + 1).trim();
}

function isAcceptedImageFile(file) {
  const extension = getFileExtension(file.name);
  const contentType = (file.type || '').toLowerCase();

  return (
    ACCEPTED_EXTENSIONS.has(extension) &&
    ACCEPTED_TYPES.has(contentType) &&
    MIME_TYPES_BY_EXTENSION[extension]?.has(contentType)
  );
}

function getFileExtension(filename) {
  const extensionStart = filename.lastIndexOf('.');
  if (extensionStart < 0) {
    return '';
  }

  return filename.slice(extensionStart).toLowerCase();
}

export { FILE_INPUT_ACCEPT, MAX_FILE_SIZE_MB, MAX_QUEUE_FILES, SUPPORTED_IMAGE_DESCRIPTION };
