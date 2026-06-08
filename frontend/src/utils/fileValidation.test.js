import { describe, expect, it } from 'vitest';
import {
  FILE_INPUT_ACCEPT,
  getCanonicalUploadFilename,
  normalizeFilename,
  validateSingleFile,
} from './fileValidation';

function makeFile(name, type = 'image/png', size = 4) {
  return new File([new Uint8Array(size)], name, { type });
}

describe('file validation utilities', () => {
  it.each([
    ['label.png', 'label.png'],
    ['images/label.png', 'label.png'],
    ['folder\\label.png', 'label.png'],
    [' nested/folder/Label.Final.PNG ', 'Label.Final.PNG'],
    ['', ''],
    ['   ', ''],
  ])('canonicalizes upload filenames from %s', (input, expected) => {
    expect(getCanonicalUploadFilename(input)).toBe(expected);
  });

  it.each([
    ['Label.PNG', 'label.png'],
    ['images/Label.PNG', 'label.png'],
    ['folder\\Label.PNG', 'label.png'],
    ['  Label.Final.TIFF  ', 'label.final.tiff'],
  ])('normalizes filenames from %s', (input, expected) => {
    expect(normalizeFilename(input)).toBe(expected);
  });

  it.each([
    ['label.jpg', 'image/jpeg'],
    ['label.jpeg', 'image/jpeg'],
    ['label.png', 'image/png'],
    ['label.webp', 'image/webp'],
    ['label.tif', 'image/tiff'],
    ['label.tiff', 'image/tiff'],
    ['LABEL.PNG', 'image/png'],
  ])('accepts supported upload metadata %s %s', (name, type) => {
    expect(validateSingleFile(makeFile(name, type))).toBe('');
  });

  it.each([
    ['label.svg', 'image/svg+xml'],
    ['label.png', ''],
    ['label', 'image/png'],
    ['label.png.exe', 'application/octet-stream'],
    ['label.jpg', 'image/jpg'],
    ['label.webp', 'image/png'],
  ])('rejects unsupported upload metadata %s %s', (name, type) => {
    expect(validateSingleFile(makeFile(name, type))).toMatch('Please upload');
  });

  it('rejects oversized files', () => {
    const oversizedFile = makeFile('large.png', 'image/png', 5 * 1024 * 1024 + 1);

    expect(validateSingleFile(oversizedFile)).toMatch('smaller than 5 MB');
  });

  it('exports an accept list covering supported extensions and MIME types', () => {
    expect(FILE_INPUT_ACCEPT).toContain('.webp');
    expect(FILE_INPUT_ACCEPT).toContain('.tiff');
    expect(FILE_INPUT_ACCEPT).toContain('image/tiff');
  });
});
