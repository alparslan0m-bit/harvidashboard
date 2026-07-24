import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../../lib/utils";

interface TrendBadgeProps {
  value: number;
  className?: string;
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({ value, className }) => {
  const isPositive = value > 0;

  if (value === 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold animate-scale-in",
        isPositive
          ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          : "bg-gradient-to-br from-rose-500/20 to-rose-600/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
        className
      )}
    >
      {isPositive ? (
        <>
          <TrendingUp className="h-3.5 w-3.5 shrink-0" />
          <span>+{value.toFixed(1)}%</span>
        </>
      ) : (
        <>
          <TrendingDown className="h-3.5 w-3.5 shrink-0" />
          <span>{value.toFixed(1)}%</span>
        </>
      )}
    </span>
  );
};

export default TrendBadge;
