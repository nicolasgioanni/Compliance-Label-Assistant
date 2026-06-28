import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Skeleton, SkeletonBlock, SkeletonText } from './Skeleton';

describe('Skeleton', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders decorative placeholders with stable sizing classes', () => {
    render(
      <Skeleton
        aria-hidden="false"
        as="div"
        className="custom-skeleton"
        data-testid="skeleton"
        height="2rem"
        width="6rem"
      />,
    );

    const skeleton = screen.getByTestId('skeleton');

    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton).toHaveClass('skeleton', 'custom-skeleton');
    expect(skeleton.getAttribute('style')).toContain('--skeleton-height: 2rem');
    expect(skeleton.getAttribute('style')).toContain('--skeleton-width: 6rem');
  });

  it('provides text and block variants', () => {
    render(
      <>
        <SkeletonText data-testid="text-skeleton" width="50%" />
        <SkeletonBlock data-testid="block-skeleton" height="4rem" radius="999px" />
      </>,
    );

    expect(screen.getByTestId('text-skeleton')).toHaveClass('skeleton', 'skeleton-text');
    expect(screen.getByTestId('block-skeleton')).toHaveClass('skeleton', 'skeleton-block');
    expect(screen.getByTestId('block-skeleton').getAttribute('style')).toContain('--skeleton-radius: 999px');
  });
});
