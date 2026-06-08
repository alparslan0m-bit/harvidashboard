import React from "react";
import { cn } from "../../lib/utils";
import { TrendBadge } from "./TrendBadge";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string } | null;
  color?: "emerald" | "red" | "amber" | "indigo" | "zinc";
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  color = "zinc",
  className,
}) => {
  // Map color options to premium styles
  const colorStyles = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    zinc: "bg-muted text-muted-foreground",
  };

  const selectedColorStyle = colorStyles[color] || colorStyles.zinc;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card p-5 shadow-sm flex flex-col justify-between select-none transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">
            {title}
          </span>
          {icon && (
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", selectedColorStyle)}>
              {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4" })}
            </div>
          )}
        </div>
        <div className="text-2xl font-bold tabular-nums text-foreground">
          {value}
        </div>
      </div>
      {(trend || description) && (
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          {trend && <TrendBadge value={trend.value} />}
          <span className="text-[11px] text-muted-foreground">
            {trend?.label ? `${trend.label} ` : ""}
            {description}
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
