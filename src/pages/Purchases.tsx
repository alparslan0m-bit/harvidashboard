import React, { useState } from "react";
import { Link } from "react-router";
import { usePurchases, usePurchasesSummary, usePurchaseMutations } from "../hooks/usePurchases";
import { DataTable } from "../components/shared/DataTable";
import { StatusBadge } from "../components/shared/StatusBadge";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { formatCurrency, formatDateTime } from "../lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { DollarSign, Search, User, CornerUpLeft, RefreshCw, AlertTriangle } from "lucide-react";

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

  // Define table columns
  const columns: ColumnDef<any>[] = [
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
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card border border-destructive/20 rounded-xl max-w-md mx-auto mt-12 text-center select-none">
        <div className="h-10 w-10 text-destructive bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Failed to load Transaction Ledger</h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 flex items-center gap-2 px-4 py-2 text-xs font-semibold border rounded-md hover:bg-accent hover:text-accent-foreground transition"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page description */}
      <div className="select-none">
        <h2 className="text-sm font-medium text-muted-foreground">Monetization Ledger</h2>
        <p className="text-xs text-muted-foreground">Monitor mobile app transactions, payments, and refunds</p>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
        <div className="border bg-card p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Total Active Revenue</span>
            <span className="text-lg font-bold text-foreground mt-0.5 block">
              {isSummaryLoading ? "Calculating..." : `$${summary.activeRevenue.toFixed(2)}`}
            </span>
          </div>
        </div>

        <div className="border bg-card p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center shrink-0">
            <CornerUpLeft className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Total Refunds Issued</span>
            <span className="text-lg font-bold text-destructive mt-0.5 block">
              {isSummaryLoading ? "Calculating..." : `$${summary.refundedRevenue.toFixed(2)}`}
            </span>
          </div>
        </div>

        <div className="border bg-card p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Total Pending Revenue</span>
            <span className="text-lg font-bold text-amber-600 mt-0.5 block">
              {isSummaryLoading ? "Calculating..." : `$${summary.pendingRevenue.toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Filter toolbar panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-card border p-4 rounded-xl shadow-sm select-none">
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
      </div>

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
