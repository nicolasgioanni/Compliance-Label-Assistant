# Testing

This project uses fast automated tests for backend validation and frontend queue behavior, plus a small manual smoke-test checklist for browser-only file picker behavior.

## Commands

Backend:

```powershell
cd backend
python -m pytest
python -m ruff check app
```

Frontend:

```powershell
cd frontend
npm test
npm run build
```

## Upload Validation Matrix

Backend tests cover the security-critical upload path before extraction:

- Allowed formats: JPG/JPEG, PNG, WebP, TIF/TIFF, uppercase extensions, and uppercase MIME casing.
- Rejected metadata: missing filename, blank filename, no extension, double-extension traps, unsupported extensions, unsupported MIME aliases, and empty MIME values.
- Rejected bytes: empty files, corrupt image bytes, file-size overflow, decoded format mismatch, MIME/content mismatch, and pixel-count overflow.
- Request safety: invalid uploads return user-facing errors before OpenAI extraction is called.

Frontend tests cover fast client-side queue decisions before upload:

- Filename normalization: plain filenames, slash paths, backslash paths, whitespace, casing, multiple dots, and empty values.
- File metadata checks: supported formats, unsupported formats, empty MIME, bad extension, MIME/extension mismatch, and oversized files.
- Queue planning: single-file then folder duplicate, folder then single-file duplicate, duplicate basenames in different folders, duplicates within one folder selection, mixed valid/duplicate/invalid/over-limit selections, full queue, and active queue filtering.
- Upload controls: Add Files and Add Folder inputs expose the same accept list, with folder-specific attributes on the folder input.

Frontend workflow tests are split by user flow:

- Queue basics: add, remove, select, filter, and queue lock behavior.
- Verification and result navigation: selected-label verification, ready-label verification, stale-result handling, and Back to Results.
- Copy expected data: target selection, source clearing, overwrite warnings, and result clearing when copied fields change.
- Manual final decisions: apply, clear, badges, selected-label display, and summary counts.
- Export dialogs: CSV and Excel routing, dialog dismissal, export rows, and Excel failure banner handling.

## Manual Smoke Tests

Run these after major UI upload changes:

- Add one file, then add a folder containing the same basename; the folder duplicate should be skipped.
- Add a folder first, then add a single file with the same basename; the single-file duplicate should be skipped.
- Add two files with the same basename from different folder paths; only the first should queue.
- Add valid files, duplicates, unsupported files, and over-limit files together; the queue should contain only valid unique files and show one combined warning.

## Performance Notes

- Frontend queue validation is O(n) over selected files and uses `Set` lookups; it does not read image bytes or hash file contents.
- Backend validation reads upload bytes once, verifies metadata before opening images, checks decoded format and pixel count before preprocessing, and rejects duplicate batch basenames before per-file processing.
