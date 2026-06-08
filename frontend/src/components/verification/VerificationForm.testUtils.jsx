import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { expect, vi } from 'vitest';
import { verifySingleLabel } from '../../api/verificationApi';
import { downloadQueueResultsCsv, downloadQueueResultsXlsx } from '../../utils/resultExport';
import VerificationForm from './VerificationForm';

export {
  act,
  cleanup,
  downloadQueueResultsCsv,
  downloadQueueResultsXlsx,
  fireEvent,
  render,
  screen,
  VerificationForm,
  verifySingleLabel,
  waitFor,
  within,
};
export function makeFile(name, type = 'image/png', size = 4) {
  return new File([new Uint8Array(size)], name, { type });
}

export function makeFolderFile(name, relativePath, type = 'image/png') {
  const file = makeFile(name, type);
  Object.defineProperty(file, 'webkitRelativePath', {
    configurable: true,
    value: relativePath,
  });
  return file;
}

export function fileInputs(container) {
  return container.querySelectorAll('input[type="file"]');
}

export function queueFilenames(container) {
  return container.querySelectorAll('.queue-filename');
}

export function addBrandName(value) {
  fireEvent.change(screen.getByLabelText(/Brand Name/i), { target: { value } });
}

export function selectQueueLabel(filename) {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`Select label ${filename}`, 'i') }));
}

export function hasExactText(text) {
  return (_, node) =>
    node?.textContent === text && Array.from(node.children).every((child) => child.textContent !== text);
}

export function getResultMetaValue(label, value) {
  return within(screen.getByText(label).closest('div')).getByText(value);
}

export function getQueueSummaryValue(label) {
  return screen.getByText(label).closest('.queue-summary-stat')?.querySelector('dd')?.textContent;
}

export function successfulVerificationResult(overrides = {}) {
  return {
    overall_status: 'pass',
    processing_time_ms: 42,
    validation_time_ms: 3,
    preprocessing_time_ms: 7,
    extraction_time_ms: 30,
    verification_time_ms: 2,
    preprocessed_image_bytes: 2048,
    preprocessed_image_width: 1000,
    message: 'AI extraction completed and deterministic field verification was applied.',
    field_results: [
      {
        field_name: 'brand_name',
        status: 'pass',
        expected: 'Review Brand',
        found: 'Review Brand',
        reason: 'The brand name matches the selected label.',
        confidence: 0.99,
      },
    ],
    extracted_fields: {
      brand_name: 'Review Brand',
      class_type: 'Whiskey',
      alcohol_content: '40%',
      net_contents: '750 mL',
      government_warning_text: 'GOVERNMENT WARNING',
      raw_text: null,
    },
    ...overrides,
  };
}

export function mockObjectUrl(objectUrl = 'blob:test-object-url') {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => objectUrl),
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: vi.fn(),
  });

  return () => {
    restoreUrlObjectMethod('createObjectURL', originalCreateObjectURL);
    restoreUrlObjectMethod('revokeObjectURL', originalRevokeObjectURL);
  };
}

export async function renderVerifiedQueue(filename = 'verified-label.png') {
  verifySingleLabel.mockResolvedValueOnce(successfulVerificationResult());
  const showError = vi.fn();
  const rendered = render(<VerificationForm showError={showError} />);
  const [fileInput] = fileInputs(rendered.container);

  fireEvent.change(fileInput, { target: { files: [makeFile(filename)] } });
  addBrandName('Review Brand');
  fireEvent.click(screen.getByRole('button', { name: 'Verify Selected Label' }));

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Export Results' })).not.toBeDisabled();
  });

  return { ...rendered, showError };
}

function restoreUrlObjectMethod(methodName, originalMethod) {
  if (originalMethod) {
    Object.defineProperty(URL, methodName, {
      configurable: true,
      value: originalMethod,
    });
    return;
  }

  delete URL[methodName];
}
