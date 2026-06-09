import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import QueueSummaryBar from './QueueSummaryBar';

describe('QueueSummaryBar', () => {
  afterEach(() => {
    cleanup();
  });

  it('describes non-passing results as informational automated status', () => {
    render(
      <QueueSummaryBar
        summary={{
          checkedCount: 4,
          errorCount: 1,
          failedCount: 3,
          failCount: 2,
          passedCount: 1,
          totalLabels: 4,
        }}
      />,
    );

    expect(screen.getByText('3 Labels Need Attention')).toBeInTheDocument();
    expect(screen.queryByText(/Review 3 Failed Labels/i)).not.toBeInTheDocument();

    fireEvent.focus(screen.getByRole('button', { name: 'About labels needing attention' }));

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Informational status only. This includes 2 Fail results and 1 Error result. Overall status comes from automated verification and cannot be changed manually.',
    );
  });
});
