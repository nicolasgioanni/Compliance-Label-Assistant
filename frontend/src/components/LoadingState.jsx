export default function LoadingState({ mode }) {
  return (
    <div className="loading-state" aria-live="polite">
      {mode === 'batch' ? 'Verifying batch...' : 'Verifying label...'}
    </div>
  );
}
