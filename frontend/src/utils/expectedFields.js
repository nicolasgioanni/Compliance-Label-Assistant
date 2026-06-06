import { DEFAULT_GOVERNMENT_WARNING } from '../constants/defaultWarningText';

export const EXPECTED_FIELD_DEFINITIONS = [
  { id: 'brandName', label: 'Brand Name', type: 'text', required: true },
  { id: 'classType', label: 'Class / Type Designation', type: 'text', multiline: false },
  { id: 'alcoholContent', label: 'Alcohol Content', type: 'text', multiline: false },
  { id: 'netContents', label: 'Net Contents', type: 'text', multiline: false },
  { id: 'bottlerProducer', label: 'Name and address of bottler/producer', type: 'text', multiline: false },
  { id: 'countryOfOrigin', label: 'Country of Origin (imports only)', type: 'text', multiline: false },
  { id: 'governmentWarning', label: 'Government Warning Text', hidden: true },
];

export const VISIBLE_EXPECTED_FIELD_DEFINITIONS = EXPECTED_FIELD_DEFINITIONS.filter((field) => !field.hidden);
export const REQUIRED_EXPECTED_FIELD_DEFINITIONS = EXPECTED_FIELD_DEFINITIONS.filter((field) => field.required);

export const EXAMPLE_EXPECTED_FIELDS = {
  brandName: 'OLD TOM DISTILLERY',
  classType: 'Kentucky Straight Bourbon Whiskey',
  alcoholContent: '45% Alc./Vol. (90 Proof)',
  netContents: '750 mL',
  bottlerProducer: 'Old Tom Distillery, Louisville, KY',
  countryOfOrigin: '',
  governmentWarning: DEFAULT_GOVERNMENT_WARNING,
};

export function createEmptyExpectedFields() {
  return EXPECTED_FIELD_DEFINITIONS.reduce((fields, field) => {
    fields[field.id] = field.id === 'governmentWarning' ? DEFAULT_GOVERNMENT_WARNING : '';
    return fields;
  }, {});
}

export function getMissingExpectedFieldLabels(expectedFields) {
  return REQUIRED_EXPECTED_FIELD_DEFINITIONS.filter((field) => !expectedFields[field.id]?.trim()).map(
    (field) => field.label,
  );
}

export function hasCompleteExpectedFields(expectedFields) {
  return getMissingExpectedFieldLabels(expectedFields).length === 0;
}
