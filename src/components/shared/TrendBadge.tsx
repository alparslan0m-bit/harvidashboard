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
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-medium tracking-wide tabular-nums",
        isPositive
          ? "bg-success/10 text-success"
          : "bg-destructive/10 text-destructive",
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
