import React from "react";
import { CopyButton } from "@/components/shared/CopyButton";
import { MetricCard } from "@/components/shared/MetricCard";
import { formatDate } from "@/lib/utils";
import { BarChart3, Calendar, CheckCircle2, ClipboardList, Flame } from "lucide-react";
import type { UserWithDetails } from "@/types/database";

export function getUserInitials(name: string | null | undefined) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const UserDetailProfile: React.FC<{ user: UserWithDetails }> = ({ user }) => (
  <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-card">
    <div className="absolute inset-0 bg-vercel-mesh opacity-20 dark:opacity-10 pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-5">
      <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xl shadow-elevated shrink-0 ring-4 ring-background/80">
        {user.profile?.avatar_url ? (
          <img
            src={user.profile.avatar_url}
            alt={user.profile.full_name || ""}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          getUserInitials(user.profile?.full_name)
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate font-heading tracking-tight">
          {user.profile?.full_name || "Anonymous Student"}
        </h2>
        <div className="flex items-center gap-1.5 mt-1">
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          <CopyButton text={user.email} className="shrink-0 h-6 w-6 [&_svg]:h-3 [&_svg]:w-3" />
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs sm:text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span>Member since {formatDate(user.created_at)}</span>
        </div>
      </div>
    </div>
  </div>
);

export const UserDetailStatsGrid: React.FC<{ user: UserWithDetails }> = ({ user }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <MetricCard
      title="Average Score"
      value={user.stats?.average_score ? `${user.stats.average_score}%` : "0%"}
      icon={<BarChart3 />}
      compact
    />
    <MetricCard
      title="Current Streak"
      value={`${user.stats?.current_streak || 0} days`}
      icon={<Flame />}
      compact
    />
    <MetricCard
      title="Quizzes Taken"
      value={String(user.stats?.total_quizzes || 0)}
      icon={<ClipboardList />}
      compact
    />
    <MetricCard
      title="Answers Saved"
      value={String(user.stats?.total_questions_answered || 0)}
      icon={<CheckCircle2 />}
      compact
    />
  </div>
);
