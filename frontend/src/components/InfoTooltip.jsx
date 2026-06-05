export default function InfoTooltip({ label, children }) {
  return (
    <span className="info-tooltip">
      <button aria-label={label} className="info-tooltip-trigger" type="button">
        i
      </button>
      <span className="info-tooltip-content" role="tooltip">
        {children}
      </span>
    </span>
  );
}
