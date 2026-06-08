import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/verificationApi', () => ({
  verifySingleLabel: vi.fn(),
}));

vi.mock('../utils/resultExport', () => ({
  downloadQueueResultsCsv: vi.fn(),
  downloadQueueResultsXlsx: vi.fn(),
}));
import {
  cleanup,
  downloadQueueResultsCsv,
  downloadQueueResultsXlsx,
  fireEvent,
  renderVerifiedQueue,
  screen,
  waitFor,
  within,
} from './VerificationForm.testUtils';
describe('VerificationForm.export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('opens the export dialog with Excel selected by default', async () => {
    await renderVerifiedQueue();
    const exportButton = screen.getByRole('button', { name: 'Export Results' });

    fireEvent.click(exportButton);
    const dialog = screen.getByRole('dialog', { name: 'Which file type would you like to download?' });

    expect(within(dialog).getByRole('button', { name: 'About exported results' })).toBeInTheDocument();
    expect(within(dialog).getByRole('radio', { name: 'Excel workbook (.xlsx)' })).toBeChecked();
    expect(within(dialog).getByRole('radio', { name: 'CSV file (.csv)' })).not.toBeChecked();
    expect(within(dialog).getByRole('button', { name: 'Back' })).toHaveClass('export-dialog-back-button');
    expect(within(dialog).getByRole('button', { name: 'Download' })).toBeInTheDocument();
  });

  it('routes CSV downloads after selecting CSV', async () => {
    await renderVerifiedQueue();
    const exportButton = screen.getByRole('button', { name: 'Export Results' });

    fireEvent.click(exportButton);
    const dialog = screen.getByRole('dialog', { name: 'Which file type would you like to download?' });
    fireEvent.click(within(dialog).getByRole('radio', { name: 'CSV file (.csv)' }));
    expect(within(dialog).getByRole('radio', { name: 'CSV file (.csv)' })).toBeChecked();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Download' }));

    expect(downloadQueueResultsCsv).toHaveBeenCalledTimes(1);
    expect(downloadQueueResultsXlsx).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('routes Excel downloads from the default selection', async () => {
    await renderVerifiedQueue();
    const exportButton = screen.getByRole('button', { name: 'Export Results' });

    fireEvent.click(exportButton);
    const dialog = screen.getByRole('dialog', { name: 'Which file type would you like to download?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Download' }));

    expect(downloadQueueResultsCsv).not.toHaveBeenCalled();
    expect(downloadQueueResultsXlsx).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows an error banner request when Excel export fails', async () => {
    downloadQueueResultsXlsx.mockRejectedValueOnce(new Error('export failed'));
    const { showError } = await renderVerifiedQueue();
    const exportButton = screen.getByRole('button', { name: 'Export Results' });

    fireEvent.click(exportButton);
    const dialog = screen.getByRole('dialog', { name: 'Which file type would you like to download?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Download' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith('Excel export could not be completed. Try CSV export or try again.');
    });
  });

  it('closes the export dialog without downloading from back, outside click, or Escape', async () => {
    const { container } = await renderVerifiedQueue();
    const exportButton = screen.getByRole('button', { name: 'Export Results' });

    fireEvent.click(exportButton);
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(exportButton);
    fireEvent.mouseDown(container.querySelector('.export-dialog-overlay'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(exportButton);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(downloadQueueResultsCsv).not.toHaveBeenCalled();
    expect(downloadQueueResultsXlsx).not.toHaveBeenCalled();
  });
});
