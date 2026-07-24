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
      <div className="relative flex h-3 w-3 items-center justify-center">
        <span
          className={cn(
            "relative inline-flex h-2.5 w-2.5 rounded-full transition-all duration-300",
            active
              ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_10px_rgba(52,211,153,0.25)] animate-glowPulse"
              : "bg-muted-foreground/30"
          )}
        ></span>
      </div>
      <span className={active ? "text-success" : "text-muted-foreground"}>
        {active ? "Live" : "Offline"}
      </span>
    </div>
  );
};

export default LiveIndicator;
