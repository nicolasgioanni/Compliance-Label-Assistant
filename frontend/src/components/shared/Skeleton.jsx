function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(' ');
}

function getSkeletonStyle({ height, radius, style, width }) {
  return {
    '--skeleton-height': height,
    '--skeleton-radius': radius,
    '--skeleton-width': width,
    ...style,
  };
}

export function Skeleton({
  as: Component = 'span',
  className = '',
  height,
  radius,
  style,
  width,
  ...props
}) {
  return (
    <Component
      {...props}
      aria-hidden="true"
      className={joinClassNames('skeleton', className)}
      style={getSkeletonStyle({ height, radius, style, width })}
    />
  );
}

export function SkeletonText({ className = '', height = '0.9rem', width = '100%', ...props }) {
  return (
    <Skeleton
      {...props}
      className={joinClassNames('skeleton-text', className)}
      height={height}
      radius="999px"
      width={width}
    />
  );
}

export function SkeletonBlock({
  className = '',
  height = '3rem',
  radius = 'var(--radius-control)',
  width = '100%',
  ...props
}) {
  return (
    <Skeleton
      {...props}
      className={joinClassNames('skeleton-block', className)}
      height={height}
      radius={radius}
      width={width}
    />
  );
}
