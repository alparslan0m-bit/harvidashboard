import React from "react";
import { cn } from "../../lib/utils";
import { TrendBadge } from "./TrendBadge";

export interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string } | null;
  className?: string;
  compact?: boolean;
  featured?: boolean;
  staggerIndex?: number;
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
  staggerIndex,
}) => {
  const baseClasses = cn(
    "relative overflow-hidden rounded-[8px] border shadow-[var(--shadow-card)] flex transition-all duration-200 hover-lift animate-fade-in-up",
    staggerIndex !== undefined && `stagger-${(staggerIndex % 6) + 1}`,
    featured 
      ? "bg-primary text-primary-foreground border-transparent" 
      : "bg-card border-border hover:border-primary/20 hover:shadow-primary/5"
  );

  if (compact) {
    return (
      <div className={cn(baseClasses, "items-center justify-between px-4 py-3", className)}>
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className={cn(
                "h-8 w-8 rounded-md flex items-center justify-center shrink-0 [&_svg]:h-4 [&_svg]:w-4 transition-transform duration-200 group-hover:scale-110",
                featured ? "bg-primary-foreground/10 text-primary-foreground" : "bg-gradient-to-br from-muted to-muted/50 text-muted-foreground shadow-sm hover:scale-105"
              )}
            >
              {icon}
            </div>
          )}
          <div>
            <span className={cn("text-[12px] font-mono uppercase block leading-tight", featured ? "text-primary-foreground/70" : "text-muted-foreground")}>
              {title}
            </span>
            <div className={cn("text-2xl font-semibold tracking-tight tabular-nums leading-tight mt-1", featured ? "text-gradient" : "text-foreground")}>
              {value}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(baseClasses, "flex-col p-5 min-h-[120px]", className)}>
      <div className="flex flex-col items-start">
        {icon && (
          <div
            className={cn(
              "h-10 w-10 rounded-[6px] flex items-center justify-center shrink-0 [&_svg]:h-5 [&_svg]:w-5 transition-transform duration-200 group-hover:scale-110",
              featured ? "bg-primary-foreground/10 text-primary-foreground" : "bg-gradient-to-br from-muted to-muted/50 text-muted-foreground shadow-sm hover:scale-105"
            )}
          >
            {icon}
          </div>
        )}
        <span className={cn("text-[12px] font-mono uppercase mt-2 text-left", featured ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {title}
        </span>
      </div>
      <div className="mt-auto pt-3">
        <div className={cn("text-[32px] leading-[40px] font-semibold tracking-[-1.28px] tabular-nums", featured ? "text-gradient" : "text-foreground")}>
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
