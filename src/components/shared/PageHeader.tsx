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
        "relative -mx-4 -mt-4 mb-6 sm:-mx-5 sm:-mt-5 lg:-mx-6 lg:-mt-6 px-4 sm:px-5 lg:px-6 border-b border-border bg-card overflow-hidden flex flex-col justify-center h-16 sm:h-[72px] lg:h-20 shadow-sm shrink-0",
        className,
      )}
    >
      <div className="absolute inset-0 z-0 bg-vercel-mesh opacity-30 dark:opacity-20 pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
      <div className="relative z-10 flex items-center justify-between w-full">
        {/* Left side: Mobile Menu + Page Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 -ml-1.5 rounded-md hover:bg-muted/60 hover:text-foreground text-muted-foreground lg:hidden shrink-0 focus-ring"
            aria-label="Toggle Sidebar Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading truncate">
            {title}
          </h1>
        </div>

        {/* Right side: Page Actions + Dark Mode + Notification Bell */}
        <div className="flex items-center gap-3 shrink-0">
          {actions && (
            <div className="flex items-center gap-2 pr-3 border-r border-border">
              {actions}
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative p-2 rounded-xl bg-transparent hover:bg-muted/60 transition-all duration-200 focus-ring"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
            <Moon className="absolute inset-0 m-auto h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
          </button>

          {/* Notifications Bell */}
          <NotificationBell />
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
