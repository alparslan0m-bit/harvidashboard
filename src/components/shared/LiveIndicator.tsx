import React from "react";
import { cn } from "../../lib/utils";

interface LiveIndicatorProps {
  active?: boolean;
  className?: string;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  active = true,
  className,
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-success/20 bg-success/10 select-none text-xs font-semibold tracking-wide uppercase",
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {active && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-1.5 w-1.5",
            active ? "bg-success" : "bg-muted-foreground"
          )}
        ></span>
      </span>
      <span className={active ? "text-success" : "text-muted-foreground"}>
        {active ? "Live" : "Offline"}
      </span>
    </div>
  );
};

export default LiveIndicator;
