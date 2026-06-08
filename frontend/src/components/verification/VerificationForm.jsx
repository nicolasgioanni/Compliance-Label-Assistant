import CopyClaimDataModal from '../dialogs/CopyClaimDataModal';
import LabelPreviewDialog from '../dialogs/LabelPreviewDialog';
import LabelQueue from '../queue/LabelQueue';
import QueueActions from '../queue/QueueActions';
import QueueSummaryBar from '../queue/QueueSummaryBar';
import SelectedLabelWorkspace from './SelectedLabelWorkspace';
import { useQueueItems } from '../../hooks/useQueueItems';
import { downloadQueueResultsCsv, downloadQueueResultsXlsx } from '../../utils/resultExport';

export default function VerificationForm({ showError = () => {} }) {
  const {
    activeQueueItems,
    canCopyClaimData,
    copyClaimDataDisabledReason,
    copyModalSourceItem,
    handleAddFiles,
    handleApplyCopiedExpectedFields,
    handleBackToResults,
    handleClearQueue,
    handleCloseCopyClaimDataModal,
    handleCloseLabelPreview,
    handleEditExpectedData,
    handleExpectedFieldsChange,
    handleOpenCopyClaimDataModal,
    handleOpenLabelPreview,
    handleRemoveItem,
    handleSelectQueueItem,
    handleToggleQueueFilter,
    handleVerifyReadyLabels,
    handleVerifySelected,
    hasResultForExport,
    isQueueLocked,
    isVerifyReadyDisabled,
    isVerifySelectedDisabled,
    maxQueueSize,
    previewQueueItem,
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
            onPreviewItem={handleOpenLabelPreview}
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
      {previewQueueItem ? (
        <LabelPreviewDialog
          item={previewQueueItem}
          onClose={handleCloseLabelPreview}
        />
      ) : null}
    </section>
  );
}
