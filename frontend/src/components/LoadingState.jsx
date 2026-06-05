export default function LoadingState({ mode }) {
  return (
    <div className="loading-state" aria-live="polite">
      {mode === 'queue' ? 'Verifying labels...' : 'Verifying selected label...'}
    </div>
  );
}
