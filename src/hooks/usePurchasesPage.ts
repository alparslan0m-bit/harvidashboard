import React, { useState, useMemo } from "react";
import { usePurchases, usePurchasesSummary, usePurchaseMutations } from "@/hooks/usePurchases";
import { createPurchaseColumns } from "@/components/pages/purchases/purchaseColumns";
import { DollarSign, CornerUpLeft, ShieldAlert, Hash } from "lucide-react";

export function usePurchasesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchSessionId, setSearchSessionId] = useState("");
  const [refundPurchaseId, setRefundPurchaseId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = usePurchases(
    page,
    status,
    fromDate,
    toDate,
    searchSessionId
  );

  const { summary, isLoading: isSummaryLoading } = usePurchasesSummary(
    fromDate,
    toDate,
    searchSessionId
  );

  const { refundPurchase } = usePurchaseMutations();

  const handleSearchChange = (val: string) => {
    setSearchSessionId(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  const handleFromDateChange = (val: string) => {
    setFromDate(val);
    setPage(1);
  };

  const handleToDateChange = (val: string) => {
    setToDate(val);
    setPage(1);
  };

  const handleProviderSelect = (val: string) => {
    setSearchSessionId(val);
    setPage(1);
  };

  const handleRefund = async () => {
    if (refundPurchaseId) {
      await refundPurchase(refundPurchaseId);
      setRefundPurchaseId(null);
    }
  };

  const disputedCount = useMemo(
    () => (data?.purchases || []).filter((p: any) => p.status === "disputed").length,
    [data?.purchases]
  );

  const providers = useMemo(() => {
    const set = new Set<string>();
    (data?.purchases || []).forEach((p: any) => {
      if (p.provider) set.add(p.provider);
    });
    return Array.from(set).sort();
  }, [data?.purchases]);

  const columns = useMemo(() => createPurchaseColumns({ setRefundPurchaseId }), []);

  const kpiCards = useMemo(
    () => [
      {
        title: "Active Revenue",
        value: isSummaryLoading ? "..." : `$${summary.activeRevenue.toFixed(2)}`,
        description: "Total confirmed payments",
        icon: React.createElement(DollarSign, { className: "h-4 w-4" }),
      },
      {
        title: "Refunds Issued",
        value: isSummaryLoading ? "..." : `$${summary.refundedRevenue.toFixed(2)}`,
        description: "Returned to students",
        icon: React.createElement(CornerUpLeft, { className: "h-4 w-4" }),
      },
      {
        title: "Pending Revenue",
        value: isSummaryLoading ? "..." : `$${summary.pendingRevenue.toFixed(2)}`,
        description: "Awaiting confirmation",
        icon: React.createElement(DollarSign, { className: "h-4 w-4" }),
      },
      {
        title: "Transaction Count",
        value: data?.totalCount ?? "...",
        description: disputedCount > 0 ? `${disputedCount} disputed` : "In current filters",
        icon:
          disputedCount > 0
            ? React.createElement(ShieldAlert, { className: "h-4 w-4" })
            : React.createElement(Hash, { className: "h-4 w-4" }),
      },
    ],
    [isSummaryLoading, summary, data?.totalCount, disputedCount]
  );

  return {
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
  };
}
