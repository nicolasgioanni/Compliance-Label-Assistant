const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png']);
const MAX_FILE_SIZE_MB = 5;

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

