import { createEmptyExpectedFields } from './expectedFields';

export const COPY_EXPECTED_FIELD_NAMES = [
  'brandName',
  'classType',
  'alcoholContent',
  'netContents',
  'governmentWarning',
];

const BLANK_WARNING_COPY_FIELD_NAMES = COPY_EXPECTED_FIELD_NAMES.filter((fieldName) => fieldName !== 'brandName');

export function hasBlankCopyExpectedField(expectedFields) {
  return BLANK_WARNING_COPY_FIELD_NAMES.some((fieldName) => !expectedFields[fieldName]?.trim());
}

export function hasDifferentCopyExpectedFields(expectedFields, sourceExpectedFields) {
  return COPY_EXPECTED_FIELD_NAMES.some((fieldName) => expectedFields[fieldName] !== sourceExpectedFields[fieldName]);
}

export function copyExpectedFields(expectedFields, sourceExpectedFields) {
  return COPY_EXPECTED_FIELD_NAMES.reduce(
    (nextExpectedFields, fieldName) => {
      nextExpectedFields[fieldName] = sourceExpectedFields[fieldName] || '';
      return nextExpectedFields;
    },
    { ...expectedFields },
  );
}

export function clearCopiedExpectedFields(expectedFields) {
  const emptyExpectedFields = createEmptyExpectedFields();

  return COPY_EXPECTED_FIELD_NAMES.reduce(
    (nextExpectedFields, fieldName) => {
      nextExpectedFields[fieldName] = emptyExpectedFields[fieldName] || '';
      return nextExpectedFields;
    },
    { ...expectedFields },
  );
}
