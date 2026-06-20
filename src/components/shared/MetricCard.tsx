import React from "react";
import { cn } from "../../lib/utils";
import { TrendBadge } from "./TrendBadge";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string } | null;
  className?: string;
  compact?: boolean;
  featured?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
  compact = false,
  featured = false,
}) => {
  const baseClasses = cn(
    "relative overflow-hidden rounded-xl border shadow-card flex transition-all duration-200 hover:shadow-elevated",
    featured 
      ? "bg-primary text-primary-foreground border-transparent" 
      : "bg-card border-border hover:border-primary/20"
  );

  if (compact) {
    return (
      <div className={cn(baseClasses, "items-center justify-between px-4 py-3", className)}>
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className={cn(
                "h-8 w-8 rounded-md flex items-center justify-center shrink-0 [&_svg]:h-4 [&_svg]:w-4",
                featured ? "bg-primary-foreground/10 text-primary-foreground" : "bg-muted/40 text-muted-foreground"
              )}
            >
              {icon}
            </div>
          )}
          <div>
            <span className={cn("text-xs font-semibold uppercase tracking-wider block leading-tight", featured ? "text-primary-foreground/70" : "text-muted-foreground")}>
              {title}
            </span>
            <div className={cn("text-xl font-bold tracking-tight tabular-nums font-heading leading-tight mt-0.5", featured ? "text-primary-foreground" : "text-foreground")}>
              {value}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(baseClasses, "flex-col p-5 min-h-[120px]", className)}>
      <div className="flex flex-col items-end">
        {icon && (
          <div
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 [&_svg]:h-5 [&_svg]:w-5",
              featured ? "bg-primary-foreground/10 text-primary-foreground" : "bg-muted/40 text-muted-foreground"
            )}
          >
            {icon}
          </div>
        )}
        <span className={cn("text-xs font-semibold uppercase tracking-wider mt-2 text-right", featured ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {title}
        </span>
      </div>
      <div className="mt-auto pt-3">
        <div className={cn("text-4xl font-bold tracking-tight tabular-nums font-heading", featured ? "text-primary-foreground" : "text-foreground")}>
          {value}
        </div>
        {(trend || description) && (
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            {trend && <TrendBadge value={trend.value} />}
            <span className={cn("text-xs", featured ? "text-primary-foreground/70" : "text-muted-foreground")}>
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
