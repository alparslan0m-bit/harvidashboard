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
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAdminAuth } from "../../hooks/useAdminAuth";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
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
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
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
        "fixed inset-y-0 left-0 z-40 w-[220px] border-r bg-sidebar-background border-sidebar-border text-sidebar-foreground flex flex-col h-full select-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Brand Header */}
      <div className="h-14 border-b border-sidebar-border flex items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-bold text-sm tracking-tight">Harvi Admin</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-sidebar-accent text-muted-foreground lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <h2 className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
              {group.label}
            </h2>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    end={item.href === "/"}
                    onClick={() => {
                      // Close sidebar on mobile item select
                      onClose();
                    }}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium transition-colors border-l-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-primary font-semibold"
                          : "text-muted-foreground border-l-transparent"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sidebar Bottom Profile/Sign Out */}
      <div className="border-t border-sidebar-border p-4 bg-muted/20 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 uppercase">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-foreground truncate max-w-[100px]" title={email}>
              {email}
            </span>
            <span className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">
              Admin
            </span>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
