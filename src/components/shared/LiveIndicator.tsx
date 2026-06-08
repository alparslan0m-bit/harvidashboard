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
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-border/60 bg-muted/30 select-none text-[10px] font-semibold tracking-wider uppercase",
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {active && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-1.5 w-1.5",
            active ? "bg-emerald-500" : "bg-zinc-400"
          )}
        ></span>
      </span>
      <span className={active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
        {active ? "Live" : "Offline"}
      </span>
    </div>
  );
};

export default LiveIndicator;
