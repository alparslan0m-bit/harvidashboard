import React from "react";
import { Shield, X } from "lucide-react";
import { cn } from "../../../lib/utils";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onClose: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ isCollapsed, onClose }) => {
  return (
    <div
      className={cn(
        "h-16 sm:h-[72px] lg:h-20 border-b border-border flex items-center shrink-0",
        isCollapsed ? "lg:justify-center lg:px-0 px-5 justify-between" : "px-5 justify-between"
      )}
    >
      <div
        className={cn(
          "flex items-center min-w-0",
          isCollapsed ? "lg:justify-center gap-0" : "gap-2"
        )}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
          <Shield className="h-4 w-4" />
        </div>
        <span
          className={cn(
            "font-bold text-base tracking-tight font-heading text-foreground truncate transition-opacity duration-200",
            isCollapsed && "lg:hidden"
          )}
        >
          Harvi Admin
        </span>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground lg:hidden focus-ring"
        aria-label="Close sidebar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
