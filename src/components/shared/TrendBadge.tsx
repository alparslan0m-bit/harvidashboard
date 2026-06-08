import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../../lib/utils";

interface TrendBadgeProps {
  value: number;
  className?: string;
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({ value, className }) => {
  const isPositive = value > 0;
  const isNegative = value < 0;

  if (value === 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide tabular-nums",
        isPositive
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-red-500/10 text-red-600 dark:text-red-400",
        className
      )}
    >
      {isPositive ? (
        <>
          <TrendingUp className="h-3 w-3 shrink-0" />
          <span>+{value.toFixed(1)}%</span>
        </>
      ) : (
        <>
          <TrendingDown className="h-3 w-3 shrink-0" />
          <span>{value.toFixed(1)}%</span>
        </>
      )}
    </span>
  );
};

export default TrendBadge;
