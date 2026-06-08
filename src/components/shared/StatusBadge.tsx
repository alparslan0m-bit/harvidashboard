import React from "react";
import { cn } from "../../lib/utils";

interface StatusBadgeProps {
  status: 'pending' | 'active' | 'failed' | 'refunded' | 'disputed' | 'new' | 'read' | 'resolved' | 'archived';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({ status, className }) => {
  const normalizedStatus = status.toLowerCase();

  const colorStyles: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    resolved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    
    pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
    new: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
    
    read: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-400 border-zinc-500/20",
    archived: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-500 border-zinc-500/10",
    
    failed: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
    refunded: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
    disputed: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
  };

  const currentStyles = colorStyles[normalizedStatus] || "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border capitalize tracking-wide select-none",
        currentStyles,
        className
      )}
    >
      {normalizedStatus}
    </span>
  );
});

export default StatusBadge;
