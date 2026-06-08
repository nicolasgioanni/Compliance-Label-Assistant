import { QUEUE_FILTERS } from '../utils/queueStatusFilters';
import InfoTooltip from './InfoTooltip';

export default function QueueStatusFilters({
  filtersDisabled = false,
  selectedFilterIds = new Set(),
  onToggleFilter = () => {},
}) {
  return (
    <div className="queue-filter-bar" aria-label="Label queue filters">
      <div className="queue-filter-heading">
        <span className="queue-filter-label">Filters</span>
        <InfoTooltip label="About queue filters">
          Use these buttons to choose which labels you see in the queue. A filled button is on; click it to hide that
          group, then click it again to show it. Needs Review shows labels that still need data, are ready to verify, or
          are currently verifying. Pass shows labels that passed verification. Fail shows labels that failed, need
          review, or hit an error. Filters only change what is visible here. They never delete labels or change results.
        </InfoTooltip>
      </div>
      <div className="queue-filter-pills">
        {QUEUE_FILTERS.map((filter) => {
          const isSelected = selectedFilterIds.has(filter.id);
          const className = [
            'queue-filter-pill',
            `queue-filter-pill-${filter.id.replaceAll('_', '-')}`,
            isSelected ? 'queue-filter-pill-selected' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              aria-pressed={isSelected}
              className={className}
              disabled={filtersDisabled}
              key={filter.id}
              type="button"
              onClick={() => onToggleFilter(filter.id)}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
