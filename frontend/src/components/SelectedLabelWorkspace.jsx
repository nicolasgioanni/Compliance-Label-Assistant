import { getStatusClassName } from '../utils/statusStyles';
import ExpectedFieldsForm from './ExpectedFieldsForm';
import InfoTooltip from './InfoTooltip';
import LoadingState from './LoadingState';
import SelectedResultDetail from './SelectedResultDetail';

const RESULT_STATUSES = new Set(['pass', 'fail', 'needs_review']);

export default function SelectedLabelWorkspace({
  canCopyClaimData = false,
  copyClaimDataDisabledReason = '',
  isExpanded = false,
  isQueueLocked = false,
  isVerifySelectedDisabled = true,
  selectedItem,
  onCopyClaimData,
  onEditExpectedData,
  onExpectedFieldsChange,
  onVerifySelected,
}) {
  const shouldShowResult =
    selectedItem?.result &&
    !selectedItem.isResultStale &&
    selectedItem.workspaceView !== 'form' &&
    RESULT_STATUSES.has(selectedItem.status);
  const shouldShowError = selectedItem?.status === 'error' && selectedItem.workspaceView !== 'form';
  const panelClassName = [
    'panel',
    'selected-workspace-panel',
    isExpanded ? 'selected-workspace-panel-expanded' : 'selected-workspace-panel-collapsed',
  ].join(' ');

  return (
    <section className={panelClassName}>
      <div className="selected-workspace-scroll">
        {!selectedItem ? <NoSelectedLabelState /> : null}
        {selectedItem?.status === 'verifying' ? <SelectedLoadingState /> : null}
        {shouldShowResult ? <SelectedResultDetail item={selectedItem} onEditExpectedData={onEditExpectedData} /> : null}
        {shouldShowError ? (
          <SelectedErrorState
            errorMessage={selectedItem.errorMessage}
            filename={selectedItem.filename}
            isVerifySelectedDisabled={isVerifySelectedDisabled}
            onEditExpectedData={onEditExpectedData}
            onVerifySelected={onVerifySelected}
          />
        ) : null}
        {selectedItem && selectedItem.status !== 'verifying' && !shouldShowResult && !shouldShowError ? (
          <SelectedExpectedDataState
            canCopyClaimData={canCopyClaimData}
            copyClaimDataDisabledReason={copyClaimDataDisabledReason}
            disabled={isQueueLocked}
            item={selectedItem}
            onCopyClaimData={onCopyClaimData}
            onExpectedFieldsChange={onExpectedFieldsChange}
          />
        ) : null}
      </div>
    </section>
  );
}

function NoSelectedLabelState() {
  return (
    <div className="workspace-empty-state">
      <div className="section-title-row">
        <h2>Selected Label Review</h2>
        <InfoTooltip label="About selected label review before adding labels">
          This panel becomes editable after you add a label image to the queue. Start by using the upload control in the
          Label Queue, then select the queued label you want to prepare. Once selected, this section will show the
          values the label should match. Brand name is required; the standard government warning is applied
          automatically.
        </InfoTooltip>
      </div>
      <p>Add a label image to start a selected label review.</p>
    </div>
  );
}

function SelectedLoadingState() {
  return (
    <div className="workspace-loading-state">
      <LoadingState />
    </div>
  );
}

function SelectedExpectedDataState({
  canCopyClaimData,
  copyClaimDataDisabledReason,
  disabled,
  item,
  onCopyClaimData,
  onExpectedFieldsChange,
}) {
  return (
    <div className="selected-expected-data-state">
      <ExpectedFieldsForm
        canCopyClaimData={canCopyClaimData}
        copyClaimDataDisabledReason={copyClaimDataDisabledReason}
        contextFilename={item.filename}
        disabled={disabled}
        expectedFields={item.expectedFields}
        onChange={onExpectedFieldsChange}
        onCopyClaimData={onCopyClaimData}
      />
      {item.result ? <StaleResultNotice isStale={item.isResultStale} /> : null}
    </div>
  );
}

function StaleResultNotice({ isStale }) {
  return (
    <div className={isStale ? 'stale-result-notice stale-result-notice-active' : 'stale-result-notice'}>
      {isStale
        ? 'Previous verification result is stale. Re-run verification to refresh it.'
        : 'Changing selected label data will mark the previous verification result stale.'}
    </div>
  );
}

function SelectedErrorState({
  errorMessage,
  filename,
  isVerifySelectedDisabled,
  onEditExpectedData,
  onVerifySelected,
}) {
  return (
    <div className="workspace-error-state">
      <div className="result-detail-header">
        <div className="result-title-block">
          <h2>Selected Label Review</h2>
        </div>
        <span className={getStatusClassName('error')}>Error</span>
      </div>
      <p className="claim-context result-claim-context">
        <span className="claim-context-label">
          File claim: <strong>{filename}</strong>
        </span>
      </p>
      <p className="workspace-error-message">
        {errorMessage || 'The verification request could not be completed.'}
      </p>
      <div className="workspace-inline-actions">
        <button className="secondary-button" type="button" onClick={onEditExpectedData}>
          Edit Selected Label
        </button>
        <button className="primary-button" disabled={isVerifySelectedDisabled} type="button" onClick={onVerifySelected}>
          Re-run Verification
        </button>
      </div>
    </div>
  );
}
