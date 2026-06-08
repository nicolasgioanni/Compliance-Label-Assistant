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
          Filters only change which labels are visible in this queue. They do not remove labels or change verification
          results.
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
