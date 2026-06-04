const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png']);
const MAX_FILE_SIZE_MB = 5;
const MAX_BATCH_FILES = 10;

export function validateSingleFile(file) {
  if (!file) {
    return 'Please select one label image.';
  }

  if (!ACCEPTED_TYPES.has(file.type)) {
    return 'Please upload a JPG or PNG image.';
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

  const invalidFile = files.find((file) => !ACCEPTED_TYPES.has(file.type));
  if (invalidFile) {
    return `${invalidFile.name} is not a JPG or PNG image.`;
  }

  const oversizedFile = files.find((file) => file.size / (1024 * 1024) > MAX_FILE_SIZE_MB);
  if (oversizedFile) {
    return `${oversizedFile.name} is larger than ${MAX_FILE_SIZE_MB} MB.`;
  }

  return '';
}

export { MAX_BATCH_FILES, MAX_FILE_SIZE_MB };
