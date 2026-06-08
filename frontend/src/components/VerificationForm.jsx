import CopyClaimDataModal from './CopyClaimDataModal';
import HumanReviewDecisionModal from './HumanReviewDecisionModal';
import LabelQueue from './LabelQueue';
import QueueActions from './QueueActions';
import QueueSummaryBar from './QueueSummaryBar';
import SelectedLabelWorkspace from './SelectedLabelWorkspace';
import { useQueueItems } from '../hooks/useQueueItems';
import { downloadQueueResultsCsv, downloadQueueResultsXlsx } from '../utils/resultExport';

export default function VerificationForm({ showError = () => {} }) {
  const {
    activeQueueItems,
    canCopyClaimData,
    copyClaimDataDisabledReason,
    copyModalSourceItem,
    handleAddFiles,
    handleApplyCopiedExpectedFields,
    handleApplyManualDecision,
    handleBackToResults,
    handleClearManualDecision,
    handleClearQueue,
    handleCloseCopyClaimDataModal,
    handleCloseManualDecisionModal,
    handleEditExpectedData,
    handleExpectedFieldsChange,
    handleOpenCopyClaimDataModal,
    handleOpenManualDecisionModal,
    handleRemoveItem,
    handleSelectQueueItem,
    handleToggleQueueFilter,
    handleVerifyReadyLabels,
    handleVerifySelected,
    hasResultForExport,
    isQueueLocked,
    isVerifyReadyDisabled,
    isVerifySelectedDisabled,
    manualDecisionModalItem,
    maxQueueSize,
    queueSummary,
    removingQueueItemIds,
    selectedItem,
    selectedQueueFilterIds,
    selectedQueueItemId,
    visibleQueueItems,
  } = useQueueItems({ showError });

  return (
    <section className="verification-workflow">
      <div className="verification-layout">
        <div className="form-column">
          <LabelQueue
            maxQueueSize={maxQueueSize}
            isLocked={isQueueLocked}
            queueItems={visibleQueueItems}
            removingQueueItemIds={removingQueueItemIds}
            selectedQueueItemId={selectedQueueItemId}
            totalQueueItemCount={activeQueueItems.length}
            selectedFilterIds={selectedQueueFilterIds}
            filtersDisabled={isQueueLocked}
            onAddFiles={handleAddFiles}
            onClearQueue={handleClearQueue}
            onRemoveItem={handleRemoveItem}
            onSelectItem={handleSelectQueueItem}
            onToggleFilter={handleToggleQueueFilter}
          />
        </div>

        <div className="results-column">
          <QueueSummaryBar
            canExport={hasResultForExport && !isQueueLocked}
            summary={queueSummary}
            onExportCsv={() => downloadQueueResultsCsv(activeQueueItems)}
            onExportError={showError}
            onExportXlsx={() => downloadQueueResultsXlsx(activeQueueItems)}
          />
          <SelectedLabelWorkspace
            canCopyClaimData={canCopyClaimData}
            copyClaimDataDisabledReason={copyClaimDataDisabledReason}
            isExpanded={activeQueueItems.length > 0}
            isQueueLocked={isQueueLocked}
            isVerifySelectedDisabled={isVerifySelectedDisabled}
            selectedItem={selectedItem}
            onBackToResults={handleBackToResults}
            onCopyClaimData={handleOpenCopyClaimDataModal}
            onEditExpectedData={handleEditExpectedData}
            onExpectedFieldsChange={handleExpectedFieldsChange}
            onSetFinalDecision={handleOpenManualDecisionModal}
            onVerifySelected={handleVerifySelected}
          />
        </div>
      </div>
      <QueueActions
        isLocked={isQueueLocked}
        isVerifyReadyDisabled={isVerifyReadyDisabled}
        isVerifySelectedDisabled={isVerifySelectedDisabled}
        onVerifyReady={handleVerifyReadyLabels}
        onVerifySelected={handleVerifySelected}
      />
      {copyModalSourceItem ? (
        <CopyClaimDataModal
          queueItems={activeQueueItems}
          sourceItem={copyModalSourceItem}
          onApply={handleApplyCopiedExpectedFields}
          onClose={handleCloseCopyClaimDataModal}
        />
      ) : null}
      {manualDecisionModalItem ? (
        <HumanReviewDecisionModal
          item={manualDecisionModalItem}
          onApply={handleApplyManualDecision}
          onClear={handleClearManualDecision}
          onClose={handleCloseManualDecisionModal}
        />
      ) : null}
    </section>
  );
}
