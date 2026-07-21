import { Link } from "react-router";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { User, CornerUpLeft, Smartphone, Key, ShieldCheck } from "lucide-react";

export interface PurchaseColumnsParams {
  setRefundPurchaseId: (id: string) => void;
}

function renderProviderBadge(provider: string) {
  const p = (provider || "").toLowerCase();
  if (p === "apple_iap") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
        <Smartphone className="h-3 w-3" />
        Apple IAP
      </span>
    );
  }
  if (p === "google_play") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <Smartphone className="h-3 w-3" />
        Google Play
      </span>
    );
  }
  if (p === "code") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <Key className="h-3 w-3" />
        Access Code
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-muted text-muted-foreground border border-border">
      <ShieldCheck className="h-3 w-3" />
      {provider || "Manual"}
    </span>
  );
}

export function createPurchaseColumns({
  setRefundPurchaseId,
}: PurchaseColumnsParams): ColumnDef<any>[] {
  return [
    {
      accessorKey: "userEmail",
      header: "User Email",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground select-all">{row.original.userEmail}</span>
      ),
    },
    {
      id: "itemName",
      header: "Unlocked Module",
      cell: ({ row }) => {
        const item = row.original.modules?.name || "Module Access";
        return <span className="font-medium text-foreground">{item}</span>;
      },
    },
    {
      accessorKey: "amount_cents",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-bold text-foreground">{formatCurrency(row.original.amount_cents)}</span>
      ),
    },
    {
      accessorKey: "currency",
      header: "Currency",
      cell: ({ row }) => (
        <span className="uppercase text-muted-foreground">{row.original.currency}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "provider",
      header: "Provider",
      cell: ({ row }) => renderProviderBadge(row.original.provider),
    },
    {
      accessorKey: "payment_id",
      header: "Payment Ref",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-xs select-all">
          {row.original.payment_id || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDateTime(row.original.created_at)}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.status === "active" && (
            <button
              onClick={() => setRefundPurchaseId(row.original.id)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded border border-destructive/20 text-xs font-bold text-destructive hover:bg-destructive/10 transition"
              aria-label="Refund Transaction"
            >
              <CornerUpLeft className="h-3 w-3" />
              <span>Refund</span>
            </button>
          )}

          <Link
            to={`/users?search=${row.original.userEmail}`}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-bold text-foreground hover:bg-accent transition"
            aria-label="Inspect user details"
          >
            <User className="h-3 w-3" />
            <span>View User</span>
          </Link>
        </div>
      ),
    },
  ];
}
