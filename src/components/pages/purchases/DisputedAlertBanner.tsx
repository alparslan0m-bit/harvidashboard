import React from "react";
import { ShieldAlert } from "lucide-react";

interface DisputedAlertBannerProps {
  count: number;
}

export const DisputedAlertBanner: React.FC<DisputedAlertBannerProps> = ({ count }) => {
  if (count <= 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 select-none">
      <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
      <div>
        <span className="text-xs font-bold text-red-700 dark:text-red-400">
          {count} disputed transaction{count > 1 ? "s" : ""} detected
        </span>
        <span className="text-xs text-red-600/80 dark:text-red-400/80 ml-2">
          Review and resolve immediately to avoid chargebacks.
        </span>
      </div>
    </div>
  );
};
