import React from "react";
import { cn } from "../../lib/utils";
import { Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { NotificationBell } from "./NotificationBell";
import { useLayout } from "../../context/LayoutContext";

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  actions,
  className,
}) => {
  const { theme, setTheme } = useTheme();
  const { setSidebarOpen } = useLayout();

  return (
    <div
      className={cn(
        "relative mb-6 px-4 sm:px-5 lg:px-6 rounded-[32px] bg-background/70 glass overflow-hidden flex items-center justify-between min-h-21 shadow-elevated ring-1 ring-border/10 backdrop-blur-xl shrink-0",
        className,
      )}
    >
      <div className="absolute inset-0 z-0 bg-vercel-mesh opacity-20 dark:opacity-15 pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
      <div className="relative z-10 flex items-center justify-between w-full gap-6">
        {/* Left side: Mobile Menu + Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-2xl bg-background/90 text-muted-foreground hover:bg-muted/70 hover:text-foreground lg:hidden shrink-0 focus-ring"
            aria-label="Toggle Sidebar Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-2xl sm:text-[32px] sm:leading-10 font-semibold tracking-[-1.28px] text-foreground truncate">
              {title}
            </h1>
          </div>
        </div>

        {/* Right side: Page Actions + Dark Mode + Notification Bell */}
        <div className="flex items-center gap-3 shrink-0">
          {actions && (
            <div className="flex items-center gap-3 rounded-full border border-border/10 bg-background/95 px-4 py-2 shadow-sm shadow-slate-200/10 backdrop-blur-sm">
              {actions}
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border/15 bg-background/95 transition-all duration-200 hover:bg-muted/30 focus-ring"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
            <Moon className="absolute inset-0 m-auto h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
          </button>

          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border/15 bg-background/95 shadow-sm shadow-slate-200/10">
            <NotificationBell />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
