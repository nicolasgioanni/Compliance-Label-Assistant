export default function LoadingState() {
  return (
    <div className="loading-state" aria-live="polite">
      <span className="loading-spinner loading-state-spinner" aria-hidden="true" />
      <span>Verifying Label</span>
    </div>
  );
}
