import React from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "../../../lib/utils";

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const SidebarToggle: React.FC<SidebarToggleProps> = ({ isCollapsed, onToggleCollapse }) => {
  return (
    <div className={cn("hidden lg:block px-3 pb-2", isCollapsed && "px-2")}>
      <button
        onClick={onToggleCollapse}
        className={cn(
          "flex items-center w-full rounded-lg border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors focus-ring text-xs font-medium",
          isCollapsed ? "justify-center p-2.5" : "gap-2 px-3 py-2"
        )}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <PanelLeftOpen className="h-4 w-4 shrink-0" />
        ) : (
          <>
            <PanelLeftClose className="h-4 w-4 shrink-0" />
            <span>Collapse</span>
          </>
        )}
      </button>
    </div>
  );
};
