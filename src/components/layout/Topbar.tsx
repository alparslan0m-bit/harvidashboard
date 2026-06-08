import React from "react";
import { useLocation } from "react-router";
import { Search, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { NotificationBell } from "../shared/NotificationBell";

interface TopbarProps {
  onMenuToggle: () => void;
  onSearchTrigger: () => void;
}

const routeTitleMap: Record<string, string> = {
  "/": "Dashboard Overview",
  "/analytics": "System Analytics",
  "/curriculum": "Curriculum Management",
  "/questions": "Question Bank",
  "/import": "CSV Question Importer",
  "/purchases": "Transaction Ledger",
  "/users": "User Accounts",
  "/feedback": "Student Feedback Logs",
};

export const Topbar: React.FC<TopbarProps> = ({
  onMenuToggle,
  onSearchTrigger,
}) => {
  const { pathname } = useLocation();
  const { theme, setTheme } = useTheme();

  const title = routeTitleMap[pathname] || "Admin Console";

  return (
    <header className="h-14 border-b bg-card border-border/60 flex items-center justify-between px-4 sm:px-5 shrink-0 select-none">
      {/* Left side: Hamburger (on mobile) + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground lg:hidden shrink-0"
          aria-label="Toggle Sidebar Menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </p>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center gap-2">
        {/* Command Palette trigger */}
        <button
          onClick={onSearchTrigger}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/60 hover:bg-accent text-[11px] text-muted-foreground transition-all duration-200"
          aria-label="Search Console Command Palette"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline-flex h-4 items-center gap-0.5 rounded border bg-muted px-1 font-mono text-[9px] font-medium text-muted-foreground opacity-80">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground border border-border/60 transition-all duration-200"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
        </button>

        {/* Notifications Bell */}
        <NotificationBell />
      </div>
    </header>
  );
};

export default Topbar;
