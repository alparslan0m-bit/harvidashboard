import React from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { QuizResultWithLecture, PurchaseWithDetails } from "@/types/database";

export const UserDetailQuizHistory: React.FC<{ quizHistory: QuizResultWithLecture[] }> = ({ quizHistory }) => (
  <div className="space-y-2 select-none">
    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quiz Evaluation history (Last 20)</h4>
    <div className="scroll-fade">
      <div className="border border-border/60 rounded-lg bg-card max-h-[180px] overflow-y-auto">
        {quizHistory.length === 0 ? (
          <p className="p-4 text-center text-[10px] text-muted-foreground">No quiz completions recorded yet.</p>
        ) : (
          <table className="w-full text-left text-[11px] border-collapse">
            <thead className="bg-muted/30 text-muted-foreground border-b uppercase font-semibold">
              <tr>
                <th scope="col" className="px-4 py-2">Lecture</th>
                <th scope="col" className="px-4 py-2">Score</th>
                <th scope="col" className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {quizHistory.map((q) => (
                <tr key={q.id}>
                  <td className="px-4 py-2 font-medium text-foreground">{q.lectures?.name || "Unknown"}</td>
                  <td className="px-4 py-2 font-semibold">{q.score}%</td>
                  <td className="px-4 py-2 text-muted-foreground">{formatDate(q.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
);

export const UserDetailPurchases: React.FC<{ purchases: PurchaseWithDetails[] }> = ({ purchases }) => (
  <div className="space-y-2 select-none">
    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Commerce purchase Ledger</h4>
    <div className="scroll-fade">
      <div className="border border-border/60 rounded-lg bg-card max-h-[150px] overflow-y-auto">
        {purchases.length === 0 ? (
          <p className="p-4 text-center text-[10px] text-muted-foreground">No transaction history logged.</p>
        ) : (
          <table className="w-full text-left text-[11px] border-collapse">
            <thead className="bg-muted/30 text-muted-foreground border-b uppercase font-semibold">
              <tr>
                <th scope="col" className="px-4 py-2">Unlocked item</th>
                <th scope="col" className="px-4 py-2">Amount</th>
                <th scope="col" className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 font-medium">{p.modules?.name || p.subjects?.name || "Premium Item"}</td>
                  <td className="px-4 py-2 font-semibold">{formatCurrency(p.amount_cents)}</td>
                  <td className="px-4 py-2"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
);
