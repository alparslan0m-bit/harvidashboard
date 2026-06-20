import React from "react";
import { CopyButton } from "@/components/shared/CopyButton";
import { formatDate } from "@/lib/utils";
import { Calendar } from "lucide-react";
import type { UserWithDetails } from "@/types/database";

export function getUserInitials(name: string | null | undefined) {
  if (!name) return "U";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export const UserDetailProfile: React.FC<{ user: UserWithDetails }> = ({ user }) => (
  <div className="flex items-center gap-4 border-b pb-6 select-none">
    <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-lg shadow-sm shrink-0">
      {user.profile?.avatar_url ? (
        <img src={user.profile.avatar_url} alt={user.profile.full_name || ""} className="h-full w-full rounded-full object-cover" />
      ) : (
        getUserInitials(user.profile?.full_name)
      )}
    </div>
    <div className="min-w-0 flex-1">
      <h3 className="text-sm font-bold text-foreground truncate">{user.profile?.full_name || "Anonymous Student"}</h3>
      <div className="flex items-center gap-1.5 mt-0.5">
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        <CopyButton text={user.email} className="shrink-0" />
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>Member since {formatDate(user.created_at)}</span>
      </div>
    </div>
  </div>
);

export const UserDetailStatsGrid: React.FC<{ user: UserWithDetails }> = ({ user }) => (
  <div className="space-y-2 select-none">
    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quiz Stats Aggregate</h4>
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: "Average Score", value: user.stats?.average_score ? `${user.stats.average_score}%` : "0%" },
        { label: "Current Streak", value: `${user.stats?.current_streak || 0} days` },
        { label: "Quizzes Taken", value: String(user.stats?.total_quizzes || 0) },
        { label: "Answers Saved", value: String(user.stats?.total_questions_answered || 0) },
      ].map((stat) => (
        <div key={stat.label} className="border border-border/60 bg-muted/20 p-3 rounded-lg">
          <div className="text-xs font-bold text-foreground">{stat.value}</div>
          <div className="text-xs text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  </div>
);
