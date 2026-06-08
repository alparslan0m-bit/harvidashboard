import React, { useMemo } from "react";
import type { RecentPurchase } from "../../../hooks/useDashboard";
import { formatCurrency, formatDate } from "../../../lib/utils";
import { StatusBadge } from "../../shared/StatusBadge";
import { DataTable } from "../../shared/DataTable";
import { SectionCard } from "../../shared/SectionCard";
import { Link } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";

interface RecentPurchasesTableProps {
  purchases: RecentPurchase[];
}

export const RecentPurchasesTable: React.FC<RecentPurchasesTableProps> = ({
  purchases,
}) => {
  const columns = useMemo<ColumnDef<RecentPurchase>[]>(
    () => [
      {
        accessorKey: "email",
        header: "User",
        cell: ({ row }) => (
          <span className="font-semibold text-foreground select-all text-xs truncate block max-w-[150px]" title={row.original.email}>
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: "itemName",
        header: "Item",
        cell: ({ row }) => (
          <span className="text-foreground font-medium text-xs truncate block max-w-[140px]" title={row.original.itemName}>
            {row.original.itemName}
          </span>
        ),
      },
      {
        accessorKey: "amountCents",
        header: "Amount",
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {formatCurrency(row.original.amountCents)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.date)}
          </span>
        ),
      },
    ],
    []
  );

  const actions = (
    <Link
      to="/purchases"
      className="text-[11px] font-semibold text-foreground hover:underline transition-all"
    >
      View All
    </Link>
  );

  // Take only top 5 rows as per spec
  const visiblePurchases = useMemo(() => purchases.slice(0, 5), [purchases]);

  return (
    <SectionCard
      title="Recent Purchases"
      description="Latest module and subject transactions"
      actions={actions}
      className="p-0 border border-border/60 bg-card overflow-hidden shadow-xs flex flex-col h-auto"
    >
      <div className="px-5 pt-3">
        <DataTable
          columns={columns}
          data={visiblePurchases}
          pageCount={0}
          currentPage={1}
          onPageChange={() => {}}
          emptyStateTitle="No recent purchases"
          emptyStateDescription="Module and subject transaction logs are currently empty."
          emptyStateIcon="ShoppingBag"
        />
      </div>
    </SectionCard>
  );
};

export default RecentPurchasesTable;
