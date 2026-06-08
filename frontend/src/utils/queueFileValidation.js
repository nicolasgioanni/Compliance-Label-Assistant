import { MAX_QUEUE_FILES, normalizeFilename, validateSingleFile } from './fileValidation';

export function planQueueFileAddition({ files, activeQueueItems, maxQueueSize = MAX_QUEUE_FILES }) {
  const filesToAdd = [];
  const existingFileKeys = new Set(activeQueueItems.map((item) => normalizeFilename(getQueueItemFileKey(item))));
  const selectedFileKeys = new Set();
  let duplicateCount = 0;
  let invalidCount = 0;
  let excludedForLimitCount = 0;

  files.forEach((file) => {
    const normalizedFileKey = normalizeFilename(getFileQueueKey(file));
    if (normalizedFileKey && (existingFileKeys.has(normalizedFileKey) || selectedFileKeys.has(normalizedFileKey))) {
      duplicateCount += 1;
      return;
    }

    const fileWarning = validateSingleFile(file);
    if (fileWarning) {
      invalidCount += 1;
      return;
    }

    if (activeQueueItems.length + filesToAdd.length >= maxQueueSize) {
      excludedForLimitCount += 1;
      return;
    }

    if (normalizedFileKey) {
      selectedFileKeys.add(normalizedFileKey);
    }

    filesToAdd.push(file);
  });

  return {
    duplicateCount,
    excludedForLimitCount,
    filesToAdd,
    invalidCount,
  };
}

export function buildUploadWarningMessage({ addedCount, duplicateCount, excludedForLimitCount, invalidCount, maxQueueSize = MAX_QUEUE_FILES }) {
  const warningParts = [];

  if (invalidCount > 0) {
    warningParts.push(`Skipped ${invalidCount} unsupported or oversized ${pluralizeFile(invalidCount)}.`);
  }

  if (duplicateCount > 0) {
    warningParts.push(`Skipped ${duplicateCount} duplicate ${pluralizeFile(duplicateCount)}.`);
  }

  if (excludedForLimitCount > 0) {
    warningParts.push(
      `Skipped ${excludedForLimitCount} ${pluralizeFile(excludedForLimitCount)} because the queue limit is ${maxQueueSize} labels.`,
    );
  }

  if (!warningParts.length) {
    return '';
  }

  const addedMessage =
    addedCount > 0
      ? `Added ${addedCount} label ${addedCount === 1 ? 'image' : 'images'}.`
      : 'No label images were added.';

  return [addedMessage, ...warningParts].join(' ');
}

function getQueueItemFileKey(item) {
  return item.filename;
}

function getFileQueueKey(file) {
  return file.name;
}

function pluralizeFile(count) {
  return count === 1 ? 'file' : 'files';
}
