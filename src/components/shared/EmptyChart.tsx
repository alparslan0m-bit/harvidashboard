import React from "react";
import { BarChart3 } from "lucide-react";
import { cn } from "../../lib/utils";

interface EmptyChartProps {
  title?: string;
  description?: string;
  className?: string;
}

export const EmptyChart: React.FC<EmptyChartProps> = ({
  title = "No Data Available",
  description = "There is currently no metric data to visualize for this period.",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-full w-full rounded-lg border border-dashed border-border/80 bg-muted/10 p-6 text-center select-none",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground/60 mb-3">
        <BarChart3 className="h-5 w-5" />
      </div>
      <h4 className="text-sm font-bold text-foreground tracking-tight font-heading">
        {title}
      </h4>
      <p className="mt-1 text-sm text-muted-foreground max-w-[240px] leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default EmptyChart;
