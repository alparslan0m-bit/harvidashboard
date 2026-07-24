import React from "react";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorView } from "@/components/shared/ErrorView";
import { KPIGrid } from "@/components/shared/KPIGrid";
import { DisputedAlertBanner } from "@/components/pages/purchases/DisputedAlertBanner";
import { PurchasesFilterBar } from "@/components/pages/purchases/PurchasesFilterBar";
import { usePurchasesPage } from "@/hooks/usePurchasesPage";

export const Purchases: React.FC = () => {
  const {
    page,
    setPage,
    status,
    fromDate,
    toDate,
    searchSessionId,
    refundPurchaseId,
    setRefundPurchaseId,
    data,
    isLoading,
    error,
    refetch,
    handleSearchChange,
    handleStatusChange,
    handleFromDateChange,
    handleToDateChange,
    handleProviderSelect,
    handleRefund,
    disputedCount,
    providers,
    columns,
    kpiCards,
  } = usePurchasesPage();

  if (error) {
    return (
      <ErrorView
        title="Failed to load Transaction Ledger"
        message={error.message}
        onRetry={() => refetch()}
        className="mt-12"
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      <PageHeader title="Monetization Ledger" />

      <DisputedAlertBanner count={disputedCount} />

      <KPIGrid cards={kpiCards} compact />

      <PurchasesFilterBar
        status={status}
        fromDate={fromDate}
        toDate={toDate}
        searchSessionId={searchSessionId}
        providers={providers}
        onStatusChange={handleStatusChange}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
        onSearchChange={handleSearchChange}
        onProviderSelect={handleProviderSelect}
      />

      <DataTable
        columns={columns}
        data={data?.purchases || []}
        pageCount={data?.totalPages || 0}
        currentPage={page}
        onPageChange={setPage}
        isLoading={isLoading}
      />

      <ConfirmDialog
        isOpen={!!refundPurchaseId}
        onClose={() => setRefundPurchaseId(null)}
        onConfirm={handleRefund}
        title="Refund customer purchase?"
        description="This will issue a refund on the database transaction ledger. The customer will lose premium access associated with this purchase immediately."
        confirmText="Confirm Refund"
        variant="destructive"
      />
    </div>
  );
};

export default Purchases;
