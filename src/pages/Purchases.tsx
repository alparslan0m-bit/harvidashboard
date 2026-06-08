import React, { useState, useMemo } from "react";
import { Link } from "react-router";
import { usePurchases, usePurchasesSummary, usePurchaseMutations } from "../hooks/usePurchases";
import { DataTable } from "../components/shared/DataTable";
import { StatusBadge } from "../components/shared/StatusBadge";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { PageHeader } from "../components/shared/PageHeader";
import { ErrorView } from "../components/shared/ErrorView";
import { FilterBar } from "../components/shared/FilterBar";
import { KPIGrid } from "../components/shared/KPIGrid";
import { formatCurrency, formatDateTime } from "../lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { DollarSign, Search, User, CornerUpLeft, ShieldAlert, Hash } from "lucide-react";

export const Purchases: React.FC = () => {
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

  const handleRefund = async () => {
    if (refundPurchaseId) {
      await refundPurchase(refundPurchaseId);
      setRefundPurchaseId(null);
    }
  };

  // Compute disputed count from current page data
  const disputedCount = useMemo(
    () => (data?.purchases || []).filter((p: any) => p.status === "disputed").length,
    [data?.purchases]
  );

  // Extract unique providers for filter dropdown
  const providers = useMemo(() => {
    const set = new Set<string>();
    (data?.purchases || []).forEach((p: any) => {
      if (p.provider) set.add(p.provider);
    });
    return Array.from(set).sort();
  }, [data?.purchases]);

  // Memoize column definitions to prevent re-creation on every render
  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: "userEmail",
        header: "User Email",
        cell: ({ row }) => <span className="font-semibold text-foreground select-all">{row.original.userEmail}</span>,
      },
      {
        id: "itemName",
        header: "Unlocked Item",
        cell: ({ row }) => {
          const item = row.original.modules?.name || row.original.subjects?.name || "Premium Access";
          return <span className="text-foreground">{item}</span>;
        },
      },
      {
        accessorKey: "amount_cents",
        header: "Amount",
        cell: ({ row }) => <span className="font-bold text-foreground">{formatCurrency(row.original.amount_cents)}</span>,
      },
      {
        accessorKey: "currency",
        header: "Currency",
        cell: ({ row }) => <span className="uppercase text-muted-foreground">{row.original.currency}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "provider",
        header: "Provider",
        cell: ({ row }) => <span className="capitalize text-muted-foreground">{row.original.provider}</span>,
      },
      {
        accessorKey: "payment_id",
        header: "Payment ID",
        cell: ({ row }) => <span className="text-muted-foreground font-mono select-all">{row.original.payment_id || "N/A"}</span>,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => <span className="text-muted-foreground">{formatDateTime(row.original.created_at)}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            {row.original.status === "active" && (
              <button
                onClick={() => setRefundPurchaseId(row.original.id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded border border-destructive/20 text-[10px] font-bold text-destructive hover:bg-destructive/10 transition"
                aria-label="Refund Transaction"
              >
                <CornerUpLeft className="h-3 w-3" />
                <span>Refund</span>
              </button>
            )}
            
            <Link
              to={`/users?search=${row.original.userEmail}`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-bold text-foreground hover:bg-accent transition"
              aria-label="Inspect user details"
            >
              <User className="h-3 w-3" />
              <span>View User</span>
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  // Build KPI cards config
  const kpiCards = useMemo(
    () => [
      {
        title: "Active Revenue",
        value: isSummaryLoading ? "..." : `$${summary.activeRevenue.toFixed(2)}`,
        description: "Total confirmed payments",
        icon: <DollarSign className="h-4 w-4" />,
      },
      {
        title: "Refunds Issued",
        value: isSummaryLoading ? "..." : `$${summary.refundedRevenue.toFixed(2)}`,
        description: "Returned to students",
        icon: <CornerUpLeft className="h-4 w-4" />,
      },
      {
        title: "Pending Revenue",
        value: isSummaryLoading ? "..." : `$${summary.pendingRevenue.toFixed(2)}`,
        description: "Awaiting confirmation",
        icon: <DollarSign className="h-4 w-4" />,
      },
      {
        title: "Transaction Count",
        value: data?.totalCount ?? "...",
        description: disputedCount > 0 ? `${disputedCount} disputed` : "In current filters",
        icon: disputedCount > 0 ? <ShieldAlert className="h-4 w-4" /> : <Hash className="h-4 w-4" />,
      },
    ],
    [isSummaryLoading, summary, data?.totalCount, disputedCount]
  );

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
    <div className="space-y-6">
      <PageHeader
        title="Monetization Ledger"
        description="Monitor mobile app transactions, payments, and refunds"
      />

      {/* Disputed alert banner */}
      {disputedCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 select-none">
          <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
          <div>
            <span className="text-xs font-bold text-red-700 dark:text-red-400">
              {disputedCount} disputed transaction{disputedCount > 1 ? "s" : ""} detected
            </span>
            <span className="text-xs text-red-600/80 dark:text-red-400/80 ml-2">
              Review and resolve immediately to avoid chargebacks.
            </span>
          </div>
        </div>
      )}

      {/* Summary KPI row */}
      <KPIGrid cards={kpiCards} />

      {/* Filter toolbar panel */}
      <FilterBar className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Status</label>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none transition"
            aria-label="Filter status dropdown"
          >
            <option value="all">All Transactions</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Provider</label>
          <select
            value=""
            onChange={(e) => {
              // Provider filter is informational; could be extended to filter server-side
              if (e.target.value) {
                setSearchSessionId(e.target.value);
                setPage(1);
              }
            }}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none transition"
            aria-label="Filter provider dropdown"
          >
            <option value="">All Providers</option>
            {providers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => handleFromDateChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none transition"
            aria-label="Start date filter picker"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => handleToDateChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none transition"
            aria-label="End date filter picker"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Search Session ID</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchSessionId}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-xs text-foreground outline-none transition"
              placeholder="Session ID or ref..."
              aria-label="Search Session ID"
            />
          </div>
        </div>
      </FilterBar>

      {/* TanStack Table */}
      <DataTable
        columns={columns}
        data={data?.purchases || []}
        pageCount={data?.totalPages || 0}
        currentPage={page}
        onPageChange={setPage}
        isLoading={isLoading}
      />

      {/* Refund dialog */}
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
