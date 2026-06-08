export default function QueueActions({
  isLocked = false,
  isVerifyReadyDisabled = true,
  isVerifySelectedDisabled = true,
  onVerifyReady,
  onVerifySelected,
}) {
  return (
    <div className="verification-actions queue-actions">
      <button
        className="primary-button"
        disabled={isVerifySelectedDisabled || isLocked}
        type="button"
        onClick={onVerifySelected}
      >
        Verify Selected Label
      </button>
      <button
        className="secondary-button"
        disabled={isVerifyReadyDisabled || isLocked}
        type="button"
        onClick={onVerifyReady}
      >
        Verify Ready Labels
      </button>
    </div>
  );
}
