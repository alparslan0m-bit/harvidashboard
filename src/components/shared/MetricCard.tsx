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
    accent: "from-sky-500/60 via-sky-500/20 to-transparent",
  },
  emerald: {
    icon: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    accent: "from-emerald-500/60 via-emerald-500/20 to-transparent",
  },
  amber: {
    icon: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    accent: "from-amber-500/60 via-amber-500/20 to-transparent",
  },
  violet: {
    icon: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
    accent: "from-violet-500/60 via-violet-500/20 to-transparent",
  },
  red: {
    icon: "bg-red-500/12 text-red-600 dark:text-red-400",
    accent: "from-red-500/60 via-red-500/20 to-transparent",
  },
  zinc: {
    icon: "bg-secondary text-muted-foreground",
    accent: "from-muted-foreground/20 via-secondary to-transparent",
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
          "relative overflow-hidden rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md hover:border-primary/20",
          className
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r",
            styles.accent
          )}
          aria-hidden
        />
        <div className="flex items-center gap-3">
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
          <div>
            <span className="text-xs uppercase tracking-wide font-semibold text-muted-foreground block leading-tight">
              {title}
            </span>
            <div className="text-2xl font-bold tabular-nums text-foreground font-heading leading-tight mt-0.5">
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
        "relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-primary/20",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
          styles.accent
        )}
        aria-hidden
      />
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">
            {title}
          </span>
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
        </div>
        <div className="text-4xl font-bold tabular-nums text-foreground font-heading">
          {value}
        </div>
      </div>
      {(trend || description) && (
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          {trend && <TrendBadge value={trend.value} />}
          <span className="text-sm text-muted-foreground">
            {trend?.label ? `${trend.label} ` : ""}
            {description}
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
