import { getStatusClassName } from '../../utils/statusStyles';
import { hasCurrentResult } from '../../utils/statusResolution';
import ExpectedFieldsForm from '../verification/ExpectedFieldsForm';
import InfoTooltip from '../shared/InfoTooltip';
import LoadingState from '../shared/LoadingState';
import SelectedResultDetail from '../verification/SelectedResultDetail';

export default function SelectedLabelWorkspace({
  canCopyClaimData = false,
  copyClaimDataDisabledReason = '',
  isExpanded = false,
  isQueueLocked = false,
  isVerifySelectedDisabled = true,
  selectedItem,
  onBackToResults,
  onCopyClaimData,
  onEditExpectedData,
  onExpectedFieldsChange,
  onVerifySelected,
}) {
  const shouldShowResult =
    hasCurrentResult(selectedItem) &&
    selectedItem.workspaceView !== 'form' &&
    selectedItem.status !== 'verifying';
  const shouldShowError =
    selectedItem?.status === 'error' && !hasCurrentResult(selectedItem) && selectedItem.workspaceView !== 'form';
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
        {shouldShowResult ? (
          <SelectedResultDetail
            areActionsDisabled={isQueueLocked}
            item={selectedItem}
            onEditExpectedData={onEditExpectedData}
          />
        ) : null}
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
            onBackToResults={onBackToResults}
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
  onBackToResults,
  onCopyClaimData,
  onExpectedFieldsChange,
}) {
  const canBackToResults = hasCurrentResult(item);

  return (
    <div className="selected-expected-data-state">
      <ExpectedFieldsForm
        canBackToResults={canBackToResults}
        canCopyClaimData={canCopyClaimData}
        copyClaimDataDisabledReason={copyClaimDataDisabledReason}
        contextFilename={item.filename}
        disabled={disabled}
        expectedFields={item.expectedFields}
        onBackToResults={onBackToResults}
        onChange={onExpectedFieldsChange}
        onCopyClaimData={onCopyClaimData}
      />
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
