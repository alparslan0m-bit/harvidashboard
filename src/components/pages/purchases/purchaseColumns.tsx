import { Link } from "react-router";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { User, CornerUpLeft } from "lucide-react";

export interface PurchaseColumnsParams {
  setRefundPurchaseId: (id: string) => void;
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
      header: "Unlocked Item",
      cell: ({ row }) => {
        const item = row.original.modules?.name || row.original.subjects?.name || "Premium Access";
        return <span className="text-foreground">{item}</span>;
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
      cell: ({ row }) => (
        <span className="capitalize text-muted-foreground">{row.original.provider}</span>
      ),
    },
    {
      accessorKey: "payment_id",
      header: "Payment ID",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono select-all">
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
}
