import React from "react";
import { Search, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { NotificationBell } from "../shared/NotificationBell";

interface TopbarProps {
  onMenuToggle: () => void;
  onSearchTrigger: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onMenuToggle,
  onSearchTrigger,
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-12 border-b bg-card border-border flex items-center justify-between px-4 sm:px-5 shrink-0">
      <button
        onClick={onMenuToggle}
        className="p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground lg:hidden shrink-0 focus-ring"
        aria-label="Toggle Sidebar Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2 ml-auto">
        {/* Command Palette trigger */}
        <button
          onClick={onSearchTrigger}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border/60 hover:bg-accent text-sm text-muted-foreground transition-all duration-200 focus-ring"
          aria-label="Search Console Command Palette"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[11px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative p-2 rounded-md hover:bg-accent hover:text-accent-foreground border border-border/60 transition-all duration-200 focus-ring"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
          <Moon className="absolute inset-0 m-auto h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
        </button>

        {/* Notifications Bell */}
        <NotificationBell />
      </div>
    </header>
  );
};

export default Topbar;
