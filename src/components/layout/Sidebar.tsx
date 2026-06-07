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
} from "lucide-react";
import { cn } from "../../lib/utils";

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

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-[240px] border-r bg-sidebar-background border-sidebar-border text-sidebar-foreground flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 border-b border-sidebar-border flex items-center px-6 gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg tracking-tight">Harvi Admin</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            <h2 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/75">
              {group.label}
            </h2>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    end={item.href === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border/30"
                          : "text-muted-foreground"
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
    </aside>
  );
};
