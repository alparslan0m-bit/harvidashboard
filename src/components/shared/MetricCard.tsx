import React from "react";
import { cn } from "../../lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card/95 p-6 shadow-sm flex flex-col justify-between min-h-[132px] select-none",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground shadow-sm">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-5">
        <p className="text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
        {description && (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
export default MetricCard;
