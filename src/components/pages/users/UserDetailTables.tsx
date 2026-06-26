import React from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { QuizResultWithLecture, PurchaseWithDetails } from "@/types/database";

export const UserDetailQuizHistory: React.FC<{ quizHistory: QuizResultWithLecture[] }> = ({
  quizHistory,
}) => (
  <div className="space-y-3 select-none">
    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      Quiz Evaluation History (Last 20)
    </h4>
    {quizHistory.length === 0 ? (
      <EmptyState
        icon="ClipboardList"
        title="No quiz completions yet"
        description="This user has not completed any quizzes."
      />
    ) : (
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/30 text-muted-foreground border-b uppercase text-xs font-semibold">
              <tr>
                <th scope="col" className="px-5 py-3">
                  Lecture
                </th>
                <th scope="col" className="px-5 py-3">
                  Score
                </th>
                <th scope="col" className="px-5 py-3">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {quizHistory.map((q) => (
                <tr key={q.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">
                    {q.lectures?.name || "Unknown"}
                  </td>
                  <td className="px-5 py-3 font-semibold tabular-nums">{q.score}%</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(q.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

export const UserDetailPurchases: React.FC<{ purchases: PurchaseWithDetails[] }> = ({
  purchases,
}) => (
  <div className="space-y-3 select-none">
    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      Commerce Purchase Ledger
    </h4>
    {purchases.length === 0 ? (
      <EmptyState
        icon="ShoppingBag"
        title="No purchases recorded"
        description="This user has not made any transactions yet."
      />
    ) : (
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/30 text-muted-foreground border-b uppercase text-xs font-semibold">
              <tr>
                <th scope="col" className="px-5 py-3">
                  Unlocked Item
                </th>
                <th scope="col" className="px-5 py-3">
                  Amount
                </th>
                <th scope="col" className="px-5 py-3">
                  Status
                </th>
                <th scope="col" className="px-5 py-3">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 font-medium">
                    {p.modules?.name || p.subjects?.name || "Premium Item"}
                  </td>
                  <td className="px-5 py-3 font-semibold tabular-nums">
                    {formatCurrency(p.amount_cents)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);
