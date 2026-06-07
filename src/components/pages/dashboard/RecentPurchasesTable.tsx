import React from "react";
import type { RecentPurchase } from "../../../hooks/useDashboard";
import { formatCurrency, formatDate } from "../../../lib/utils";
import { StatusBadge } from "../../shared/StatusBadge";
import { EmptyState } from "../../shared/EmptyState";

interface RecentPurchasesTableProps {
  purchases: RecentPurchase[];
}

export const RecentPurchasesTable: React.FC<RecentPurchasesTableProps> = ({
  purchases,
}) => {
  return (
    <div className="rounded-3xl border border-border bg-card shadow-sm flex flex-col h-[400px]">
      <div className="p-6 border-b border-border/50">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Recent Purchases
        </h2>
        <p className="text-xs text-muted-foreground">
          Latest module and subject transactions
        </p>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        {purchases.length === 0 ? (
          <div className="h-full flex items-center justify-center p-6">
            <EmptyState
              icon="ShoppingBag"
              title="No purchases yet"
              description="Transaction records are currently empty."
            />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border/50 text-sm">
            <thead className="bg-muted/50 text-muted-foreground uppercase tracking-[0.18em] text-[11px] font-semibold sticky top-0 border-b border-border/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Item
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {purchases.map((purchase) => (
                <tr
                  key={purchase.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <span className="font-medium text-foreground select-all">
                      {purchase.email}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-foreground">
                    {purchase.itemName}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-foreground">
                    {formatCurrency(purchase.amountCents)}
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={purchase.status} />
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground">
                    {formatDate(purchase.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default RecentPurchasesTable;
