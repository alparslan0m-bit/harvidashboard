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
      <div className="relative flex h-2 w-2 items-center justify-center">
        {active && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            active 
              ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-[glowPulse_2s_infinite]" 
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
