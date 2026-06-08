import { describe, expect, it } from 'vitest';
import {
  createEmptyExpectedFields,
  hasAnyVisibleExpectedFieldValue,
} from './expectedFields';

describe('expected field utilities', () => {
  it('does not count hidden default fields as visible expected data', () => {
    expect(hasAnyVisibleExpectedFieldValue(createEmptyExpectedFields())).toBe(false);
  });

  it('detects any visible expected field value', () => {
    expect(
      hasAnyVisibleExpectedFieldValue({
        ...createEmptyExpectedFields(),
        classType: 'Whiskey',
      }),
    ).toBe(true);
  });

  it('ignores whitespace-only visible expected field values', () => {
    expect(
      hasAnyVisibleExpectedFieldValue({
        ...createEmptyExpectedFields(),
        brandName: '   ',
        netContents: '\t',
      }),
    ).toBe(false);
  });
});
