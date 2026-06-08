import React from "react";
import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  HelpCircle,
  FileDown,
  ShoppingBag,
  MessageSquare,
  BarChart3,
  Shield,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAdminAuth } from "../../hooks/useAdminAuth";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Curriculum", href: "/curriculum", icon: BookOpen },
      { name: "Questions", href: "/questions", icon: HelpCircle },
      { name: "CSV Import", href: "/import", icon: FileDown },
    ],
  },
  {
    label: "Commerce",
    items: [
      { name: "Purchases", href: "/purchases", icon: ShoppingBag },
    ],
  },
  {
    label: "Settings",
    items: [
      { name: "Users", href: "/users", icon: Users },
      { name: "Feedback", href: "/feedback", icon: MessageSquare },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { signOut, currentUser } = useAdminAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Failed to sign out", err);
    }
  };

  const email = currentUser?.email || "admin@harvi.app";
  const initials = email
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground flex flex-col h-full shadow-[4px_0_24px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 ease-in-out lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "w-[268px] lg:w-[72px]" : "w-[268px]"
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "h-14 border-b border-sidebar-border flex items-center shrink-0",
          isCollapsed ? "lg:justify-center lg:px-0 px-5 justify-between" : "px-5 justify-between"
        )}
      >
        <div
          className={cn(
            "flex items-center min-w-0",
            isCollapsed ? "lg:justify-center gap-0" : "gap-2.5"
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shrink-0">
            <Shield className="h-4 w-4" />
          </div>
          <span
            className={cn(
              "font-bold text-lg tracking-tight font-heading text-sidebar-foreground truncate transition-opacity duration-200",
              isCollapsed && "lg:hidden"
            )}
          >
            Harvi Admin
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-sidebar-accent text-muted-foreground lg:hidden focus-ring"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden py-5 space-y-5",
          isCollapsed ? "lg:px-2 px-3" : "px-3"
        )}
      >
        {navGroups.map((group, groupIdx) => (
          <div
            key={group.label}
            className={cn(
              "space-y-1.5",
              isCollapsed && groupIdx > 0 && "lg:pt-1 lg:border-t lg:border-sidebar-border"
            )}
          >
            <h2
              className={cn(
                "px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
                isCollapsed && "lg:hidden"
              )}
            >
              {group.label}
            </h2>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    end={item.href === "/"}
                    title={isCollapsed ? item.name : undefined}
                    onClick={() => onClose()}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center text-sm font-medium rounded-xl transition-colors focus-ring",
                        isCollapsed
                          ? "lg:justify-center lg:px-0 lg:py-2.5 gap-3 px-3 py-2.5"
                          : "gap-3 px-3 py-2.5",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )
                    }
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                    <span className={cn("truncate", isCollapsed && "lg:hidden")}>
                      {item.name}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className={cn("hidden lg:block px-3 pb-2", isCollapsed && "px-2")}>
        <button
          onClick={onToggleCollapse}
          className={cn(
            "flex items-center w-full rounded-xl border border-sidebar-border text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors focus-ring text-sm font-medium",
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

      {/* Sidebar Bottom Profile/Sign Out */}
      <div
        className={cn(
          "border-t border-sidebar-border bg-muted/40 shrink-0",
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
            <div className="h-9 w-9 rounded-full bg-sidebar-primary flex items-center justify-center text-sm font-bold text-sidebar-primary-foreground shrink-0 uppercase">
              {initials}
            </div>
            <div className={cn("flex flex-col min-w-0", isCollapsed && "lg:hidden")}>
              <span
                className="text-sm font-medium text-sidebar-foreground truncate max-w-[120px]"
                title={email}
              >
                {email}
              </span>
              <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                Admin
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors focus-ring shrink-0"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
