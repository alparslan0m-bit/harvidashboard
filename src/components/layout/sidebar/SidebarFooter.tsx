import React from "react";
import { LogOut } from "lucide-react";
import { cn } from "../../../lib/utils";

interface SidebarFooterProps {
  email: string;
  initials: string;
  isCollapsed: boolean;
  onSignOut: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  email,
  initials,
  isCollapsed,
  onSignOut,
}) => {
  return (
    <div
      className={cn(
        "border-t border-border bg-transparent shrink-0",
        isCollapsed ? "lg:p-2 p-4" : "p-4"
      )}
    >
      <div
        className={cn(
          "flex items-center",
          isCollapsed ? "lg:flex-col lg:gap-2 justify-between" : "justify-between gap-2.5"
        )}
      >
        <div
          className={cn(
            "flex items-center min-w-0",
            isCollapsed ? "lg:justify-center gap-0" : "gap-2.5"
          )}
          title={isCollapsed ? email : undefined}
        >
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0 uppercase">
            {initials}
          </div>
          <div className={cn("flex flex-col min-w-0", isCollapsed && "lg:hidden")}>
            <span
              className="text-sm font-medium text-foreground truncate max-w-[100px]"
              title={email}
            >
              {email}
            </span>
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Admin
            </span>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors focus-ring shrink-0"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
