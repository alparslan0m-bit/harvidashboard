import React from "react";
import { cn } from "../../lib/utils";
import { TrendBadge } from "./TrendBadge";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string } | null;
  color?: "emerald" | "red" | "amber" | "sky" | "violet" | "zinc";
  className?: string;
  compact?: boolean;
}

const colorStyles = {
  sky: {
    icon: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
    border: "border-l-sky-500",
  },
  emerald: {
    icon: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    border: "border-l-emerald-500",
  },
  amber: {
    icon: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    border: "border-l-amber-500",
  },
  violet: {
    icon: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
    border: "border-l-violet-500",
  },
  red: {
    icon: "bg-red-500/12 text-red-600 dark:text-red-400",
    border: "border-l-red-500",
  },
  zinc: {
    icon: "bg-secondary text-muted-foreground",
    border: "border-l-muted-foreground/40",
  },
} as const;

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  color = "zinc",
  className,
  compact = false,
}) => {
  const styles = colorStyles[color] ?? colorStyles.zinc;

  if (compact) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border border-l-4 bg-card px-3 py-3 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md hover:border-primary/20",
          styles.border,
          className
        )}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className={cn(
                "h-8 w-8 rounded-md flex items-center justify-center shrink-0 [&_svg]:h-4 [&_svg]:w-4",
                styles.icon
              )}
            >
              {icon}
            </div>
          )}
          <div>
            <span className="text-xs font-medium text-muted-foreground block leading-tight">
              {title}
            </span>
            <div className="text-xl font-bold tracking-tight tabular-nums text-foreground font-heading leading-tight mt-0.5">
              {value}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border border-l-4 bg-card p-4 shadow-sm flex flex-col transition-all duration-200 hover:shadow-md hover:border-primary/20 min-h-[120px]",
        styles.border,
        className
      )}
    >
      <div className="flex flex-col items-end">
        {icon && (
          <div
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 [&_svg]:h-5 [&_svg]:w-5",
              styles.icon
            )}
          >
            {icon}
          </div>
        )}
        <span className="text-xs font-medium text-muted-foreground mt-2 text-right">
          {title}
        </span>
      </div>
      <div className="mt-auto pt-3">
        <div className="text-4xl font-bold tracking-tight tabular-nums text-foreground font-heading">
          {value}
        </div>
        {(trend || description) && (
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            {trend && <TrendBadge value={trend.value} />}
            <span className="text-xs text-muted-foreground">
              {trend?.label ? `${trend.label} ` : ""}
              {description}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
