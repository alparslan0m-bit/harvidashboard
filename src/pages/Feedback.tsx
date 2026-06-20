import React from "react";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorView } from "@/components/shared/ErrorView";
import { FeedbackTabs } from "@/components/pages/feedback/FeedbackTabs";
import { FeedbackBulkActions } from "@/components/pages/feedback/FeedbackBulkActions";
import { useFeedbackPage } from "@/hooks/useFeedbackPage";

export const Feedback: React.FC = () => {
  const {
    page,
    setPage,
    activeTab,
    deleteId,
    setDeleteId,
    selectedIds,
    data,
    isLoading,
    error,
    refetch,
    handleTabChange,
    handleDelete,
    handleBulkArchive,
    handleBulkMarkRead,
    tabs,
    customColumns,
    tableDataWithExpansions,
  } = useFeedbackPage();

  if (error) {
    return (
      <ErrorView
        title="Failed to load Feedback logs"
        message={error.message}
        onRetry={() => refetch()}
        className="mt-12"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedback Log"
        description="Process, audit, and archive reports submitted by students"
        actions={
          selectedIds.size > 0 ? (
            <FeedbackBulkActions
              selectedCount={selectedIds.size}
              onBulkMarkRead={handleBulkMarkRead}
              onBulkArchive={handleBulkArchive}
            />
          ) : undefined
        }
      />

      <FeedbackTabs activeTab={activeTab} tabs={tabs} onTabChange={handleTabChange} />

      <DataTable
        columns={customColumns}
        data={tableDataWithExpansions}
        pageCount={data?.totalPages || 0}
        currentPage={page}
        onPageChange={setPage}
        isLoading={isLoading}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete feedback log entry?"
        description="This will permanently delete this report. This action is fully destructive and cannot be undone."
        confirmText="Delete Report"
        variant="destructive"
      />
    </div>
  );
};

export default Feedback;
