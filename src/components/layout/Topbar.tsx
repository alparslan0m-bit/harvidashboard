import React from "react";
import { useLocation } from "react-router";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";

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

export const Topbar: React.FC = () => {
  const { pathname } = useLocation();
  const { signOut, currentUser } = useAdminAuth();
  const { theme, setTheme } = useTheme();

  const title = routeTitleMap[pathname] || "Admin Console";

  return (
    <header className="h-16 border-b bg-card border-border flex items-center justify-between px-6 shrink-0 select-none">
      {/* Title */}
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Dark Mode toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground border transition"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-foreground">
              {currentUser?.email?.split("@")[0] || "Admin"}
            </span>
            <span className="text-[10px] text-muted-foreground">Super Admin</span>
          </div>

          <button
            onClick={() => signOut()}
            className="p-2 rounded-md text-destructive hover:bg-destructive/10 border border-destructive/20 transition-colors flex items-center gap-2 text-sm"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
