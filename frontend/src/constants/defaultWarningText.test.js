import { describe, expect, it } from 'vitest';
import { DEFAULT_GOVERNMENT_WARNING } from './defaultWarningText';

describe('default government warning text', () => {
  it('uses the numbered standard government warning', () => {
    expect(DEFAULT_GOVERNMENT_WARNING).toBe(
      'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.',
    );
  });
});
