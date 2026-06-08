import { describe, expect, it } from 'vitest';
import { buildUploadWarningMessage, planQueueFileAddition } from './queueFileValidation';

function makeFile(name, type = 'image/png', size = 4) {
  return new File([new Uint8Array(size)], name, { type });
}

function makeFolderFile(name, relativePath, type = 'image/png') {
  const file = makeFile(name, type);
  Object.defineProperty(file, 'webkitRelativePath', {
    configurable: true,
    value: relativePath,
  });
  return file;
}

function makeQueueItem(filename, relativePath = '') {
  return {
    filename,
    relativePath,
  };
}

describe('queue file addition planning', () => {
  it('rejects a folder file whose basename already exists from Add Files', () => {
    const plan = planQueueFileAddition({
      activeQueueItems: [makeQueueItem('tc01_valid_bourbon.png')],
      files: [makeFolderFile('tc01_valid_bourbon.png', 'images/tc01_valid_bourbon.png')],
      maxQueueSize: 10,
    });

    expect(plan.filesToAdd).toHaveLength(0);
    expect(plan.duplicateCount).toBe(1);
  });

  it('rejects a single file whose basename already exists from Add Folder', () => {
    const plan = planQueueFileAddition({
      activeQueueItems: [makeQueueItem('tc01_valid_bourbon.png', 'images/tc01_valid_bourbon.png')],
      files: [makeFile('TC01_VALID_BOURBON.PNG')],
      maxQueueSize: 10,
    });

    expect(plan.filesToAdd).toHaveLength(0);
    expect(plan.duplicateCount).toBe(1);
  });

  it('rejects duplicate basenames inside the same selected folder', () => {
    const firstFile = makeFolderFile('label.png', 'front/label.png');
    const secondFile = makeFolderFile('label.png', 'back/label.png');

    const plan = planQueueFileAddition({
      activeQueueItems: [],
      files: [firstFile, secondFile],
      maxQueueSize: 10,
    });

    expect(plan.filesToAdd).toEqual([firstFile]);
    expect(plan.duplicateCount).toBe(1);
  });

  it('keeps validation one-pass with duplicate, invalid, and limit counts separated', () => {
    const validFile = makeFile('new-label.png');
    const duplicateFile = makeFolderFile('existing.png', 'images/existing.png');
    const unsupportedFile = makeFile('bad.svg', 'image/svg+xml');
    const oversizedFile = makeFile('large.png', 'image/png', 5 * 1024 * 1024 + 1);
    const overLimitFile = makeFile('overflow.png');

    const plan = planQueueFileAddition({
      activeQueueItems: [makeQueueItem('existing.png'), makeQueueItem('slot-a.png')],
      files: [validFile, duplicateFile, unsupportedFile, oversizedFile, overLimitFile],
      maxQueueSize: 3,
    });

    expect(plan.filesToAdd).toEqual([validFile]);
    expect(plan.duplicateCount).toBe(1);
    expect(plan.invalidCount).toBe(2);
    expect(plan.excludedForLimitCount).toBe(1);
  });

  it('counts every valid file as over limit when the active queue is full', () => {
    const plan = planQueueFileAddition({
      activeQueueItems: [makeQueueItem('a.png'), makeQueueItem('b.png')],
      files: [makeFile('c.png'), makeFile('d.png')],
      maxQueueSize: 2,
    });

    expect(plan.filesToAdd).toHaveLength(0);
    expect(plan.excludedForLimitCount).toBe(2);
  });

  it('only compares against active queue items passed by the caller', () => {
    const plan = planQueueFileAddition({
      activeQueueItems: [makeQueueItem('active.png')],
      files: [makeFile('removing.png')],
      maxQueueSize: 10,
    });

    expect(plan.filesToAdd).toHaveLength(1);
    expect(plan.duplicateCount).toBe(0);
  });

  it('builds a combined upload warning message', () => {
    expect(
      buildUploadWarningMessage({
        addedCount: 1,
        duplicateCount: 2,
        excludedForLimitCount: 1,
        invalidCount: 1,
        maxQueueSize: 10,
      }),
    ).toBe(
      'Added 1 label image. Skipped 1 unsupported or oversized file. Skipped 2 duplicate files. Skipped 1 file because the queue limit is 10 labels.',
    );
  });
});
