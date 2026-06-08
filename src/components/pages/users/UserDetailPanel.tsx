import React, { useState } from "react";
import { useUserDetail, useUserMutations } from "../../../hooks/useUsers";
import { SlideOver } from "../../shared/SlideOver";
import { ConfirmDialog } from "../../shared/ConfirmDialog";
import { StatusBadge } from "../../shared/StatusBadge";
import { CopyButton } from "../../shared/CopyButton";
import { formatCurrency, formatDate } from "../../../lib/utils";
import { Award, Zap, Calendar, ShieldAlert, Trash2, Check } from "lucide-react";

interface UserDetailPanelProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserDetailPanel: React.FC<UserDetailPanelProps> = ({
  userId,
  isOpen,
  onClose,
}) => {
  const { user, quizHistory, purchases, isLoading } = useUserDetail(userId);
  const { grantAdmin, deleteUser } = useUserMutations();

  const [isAdminConfirmOpen, setIsAdminConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Helper to extract initials
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleGrantAdmin = async () => {
    if (userId) {
      await grantAdmin(userId);
    }
  };

  const handleDeleteUser = async () => {
    if (userId) {
      await deleteUser(userId);
      onClose();
    }
  };

  const userInitials = getInitials(user?.profile?.full_name);
  const isAdmin = user?.app_metadata?.role === "admin";

  return (
    <>
      <SlideOver
        isOpen={isOpen}
        onClose={onClose}
        title="User Account details"
        description="Inspect profile stats, performance history, commerce transactions, and access control."
      >
        {isLoading ? (
          <div className="space-y-6 animate-pulse select-none">
            <div className="flex items-center gap-4 border-b pb-6">
              <div className="h-16 w-16 bg-muted rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
        ) : !user ? (
          <div className="text-center py-8 text-xs text-muted-foreground select-none">
            No profile details available.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center gap-4 border-b pb-6 select-none">
              <div className="h-14 w-14 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-sm shrink-0">
                {user.profile?.avatar_url ? (
                  <img
                    src={user.profile.avatar_url}
                    alt={user.profile.full_name || ""}
                    className="h-full w-full rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  userInitials
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-foreground truncate select-all">
                  {user.profile?.full_name || "Anonymous Student"}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-muted-foreground truncate select-all">{user.email}</p>
                  <CopyButton text={user.email} className="shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Member since {formatDate(user.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Performance aggregates */}
            <div className="space-y-2 select-none">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quiz Stats Aggregate
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-border/60 bg-muted/20 p-3 rounded-lg flex items-center gap-3">
                  <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-foreground">
                      {user.stats?.average_score ? `${user.stats.average_score}%` : "0%"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Average Score</div>
                  </div>
                </div>

                <div className="border border-border/60 bg-muted/20 p-3 rounded-lg flex items-center gap-3">
                  <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-foreground">
                      {user.stats?.current_streak || 0} days
                    </div>
                    <div className="text-[10px] text-muted-foreground">Current Streak</div>
                  </div>
                </div>

                <div className="border border-border/60 bg-muted/20 p-3 rounded-lg flex items-center gap-3">
                  <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-foreground">
                      {user.stats?.total_quizzes || 0}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Quizzes Taken</div>
                  </div>
                </div>

                <div className="border border-border/60 bg-muted/20 p-3 rounded-lg flex items-center gap-3">
                  <Award className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-foreground">
                      {user.stats?.total_questions_answered || 0}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Answers Saved</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quiz history list with scroll gradient fade */}
            <div className="space-y-2 select-none">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quiz Evaluation history (Last 20)
              </h4>
              <div className="scroll-fade">
                <div className="border border-border/60 rounded-lg bg-card max-h-[180px] overflow-y-auto">
                  {quizHistory.length === 0 ? (
                    <p className="p-4 text-center text-[10px] text-muted-foreground">
                      No quiz completions recorded yet.
                    </p>
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
                            <td className="px-4 py-2 font-medium text-foreground">
                              {q.lectures?.name || "Unknown"}
                            </td>
                            <td className="px-4 py-2 text-foreground font-semibold">
                              {q.score}%
                            </td>
                            <td className="px-4 py-2 text-muted-foreground">
                              {formatDate(q.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Purchases log */}
            <div className="space-y-2 select-none">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Commerce purchase Ledger
              </h4>
              <div className="scroll-fade">
                <div className="border border-border/60 rounded-lg bg-card max-h-[150px] overflow-y-auto">
                  {purchases.length === 0 ? (
                    <p className="p-4 text-center text-[10px] text-muted-foreground">
                      No transaction history logged.
                    </p>
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
                        {purchases.map((p) => {
                          const itemName = p.modules?.name || p.subjects?.name || "Premium Item";
                          return (
                            <tr key={p.id}>
                              <td className="px-4 py-2 text-foreground font-medium">{itemName}</td>
                              <td className="px-4 py-2 text-foreground font-semibold">
                                {formatCurrency(p.amount_cents)}
                              </td>
                              <td className="px-4 py-2">
                                <StatusBadge status={p.status} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Danger zone actions */}
            <div className="space-y-2 border-t border-border/60 pt-6 select-none">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-red-500">
                Danger Zone Operations
              </h4>
              <div className="flex gap-4">
                {isAdmin ? (
                  <button
                    disabled
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-muted text-muted-foreground border border-border/60 text-xs font-semibold transition cursor-not-allowed"
                    aria-label="Already Admin"
                  >
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span>Already Admin</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAdminConfirmOpen(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-zinc-950 dark:bg-zinc-800 border border-border/60 hover:bg-zinc-900 dark:hover:bg-zinc-700/50 text-xs font-semibold text-foreground transition cursor-pointer"
                    aria-label="Grant Admin Role"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>Grant Admin Access</span>
                  </button>
                )}

                <button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-destructive text-white hover:bg-destructive/90 text-xs font-semibold transition cursor-pointer"
                  aria-label="Delete Student Profile"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Permanently Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </SlideOver>

      {/* Confirmation Modals */}
      <ConfirmDialog
        isOpen={isAdminConfirmOpen}
        onClose={() => setIsAdminConfirmOpen(false)}
        onConfirm={handleGrantAdmin}
        title="Elevate account privilege?"
        description="This will set app_metadata.role = 'admin' on Supabase Auth module, granting this account full CRUD capabilities over all system data. This action cannot be revoked from the client app."
        confirmText="Confirm Upgrade"
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteUser}
        title="Permanently delete user account?"
        description="This will delete the student authentication record, profile stats, evaluation histories, and purchased items. This operation is fully destructive and cannot be undone."
        confirmText="Yes, Delete User"
        variant="destructive"
        requireEmailConfirm={user?.email}
      />
    </>
  );
};

export default UserDetailPanel;
