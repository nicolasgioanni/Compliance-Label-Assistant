const SUPPORTED_IMAGE_DESCRIPTION = 'JPG, PNG, WebP, or TIFF';
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/tiff']);
const ACCEPTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);
const FILE_INPUT_ACCEPT = '.jpg,.jpeg,.png,.webp,.tif,.tiff,image/jpeg,image/png,image/webp,image/tiff';
const MAX_FILE_SIZE_MB = 5;
const MAX_QUEUE_FILES = 10;
const MAX_BATCH_FILES = 10;

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

export function validateExpectedFields(expectedFields) {
  const hasMissingField = Object.values(expectedFields).some((value) => !value.trim());

  if (hasMissingField) {
    return 'Please complete all expected application fields.';
  }

  return '';
}

export function validateBatchFiles(files) {
  if (!files.length) {
    return 'Please select at least 2 label images for batch verification.';
  }

  if (files.length < 2) {
    return 'Batch verification requires at least 2 label images.';
  }

  if (files.length > MAX_BATCH_FILES) {
    return `Please upload ${MAX_BATCH_FILES} files or fewer.`;
  }

  const invalidFile = files.find((file) => !isAcceptedImageFile(file));
  if (invalidFile) {
    return `${invalidFile.name} is not a ${SUPPORTED_IMAGE_DESCRIPTION} image.`;
  }

  const oversizedFile = files.find((file) => file.size / (1024 * 1024) > MAX_FILE_SIZE_MB);
  if (oversizedFile) {
    return `${oversizedFile.name} is larger than ${MAX_FILE_SIZE_MB} MB.`;
  }

  return '';
}

export function buildDuplicateFilesMessage(duplicateCount) {
  const fileLabel = duplicateCount === 1 ? 'file was' : 'files were';
  return `${duplicateCount} duplicate ${fileLabel} detected and not uploaded.`;
}

export function normalizeFilename(filename) {
  return (filename || '').trim().toLowerCase();
}

function isAcceptedImageFile(file) {
  const extension = getFileExtension(file.name);
  const contentType = (file.type || '').toLowerCase();

  return ACCEPTED_EXTENSIONS.has(extension) && ACCEPTED_TYPES.has(contentType);
}

function getFileExtension(filename) {
  const extensionStart = filename.lastIndexOf('.');
  if (extensionStart < 0) {
    return '';
  }

  return filename.slice(extensionStart).toLowerCase();
}

export { FILE_INPUT_ACCEPT, MAX_BATCH_FILES, MAX_FILE_SIZE_MB, MAX_QUEUE_FILES, SUPPORTED_IMAGE_DESCRIPTION };
