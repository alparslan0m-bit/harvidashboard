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
    
    read: "bg-muted text-muted-foreground border-border",
    archived: "bg-muted/60 text-muted-foreground border-border/60",
    
    failed: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
    refunded: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
    disputed: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
  };

  const currentStyles = colorStyles[normalizedStatus] || "bg-muted text-foreground border-border";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-normal capitalize select-none",
        currentStyles,
        className
      )}
    >
      {normalizedStatus}
    </span>
  );
});

export default StatusBadge;
