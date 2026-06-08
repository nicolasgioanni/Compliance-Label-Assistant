import { describe, expect, it } from 'vitest';
import { supportsDirectoryUpload } from './browserSupport';

describe('supportsDirectoryUpload', () => {
  it('detects webkitdirectory support', () => {
    expect(supportsDirectoryUpload({ webkitdirectory: '' })).toBe(true);
  });

  it('detects directory support', () => {
    expect(supportsDirectoryUpload({ directory: '' })).toBe(true);
  });

  it('returns false when directory selection is unavailable', () => {
    expect(supportsDirectoryUpload({})).toBe(false);
    expect(supportsDirectoryUpload(null)).toBe(false);
  });
});
