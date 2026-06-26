import React from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  HelpCircle,
  FileDown,
  ShoppingBag,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNav, type NavGroup } from "./sidebar/SidebarNav";
import { SidebarToggle } from "./sidebar/SidebarToggle";
import { SidebarFooter } from "./sidebar/SidebarFooter";

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
        "fixed inset-y-0 left-0 z-40 border-r border-border bg-card text-foreground flex flex-col h-full transition-all duration-200 ease-in-out lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "w-[240px] lg:w-[72px]" : "w-[240px]"
      )}
    >
      <SidebarHeader isCollapsed={isCollapsed} onClose={onClose} />
      
      <SidebarNav 
        groups={navGroups} 
        isCollapsed={isCollapsed} 
        onClose={onClose} 
      />

      <SidebarToggle 
        isCollapsed={isCollapsed} 
        onToggleCollapse={onToggleCollapse} 
      />

      <SidebarFooter 
        email={email} 
        initials={initials} 
        isCollapsed={isCollapsed} 
        onSignOut={handleSignOut} 
      />
    </aside>
  );
};

export default Sidebar;
