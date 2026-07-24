import React from "react";
import { NavLink } from "react-router";
import { cn } from "../../../lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

interface SidebarNavProps {
  groups: NavGroup[];
  isCollapsed: boolean;
  onClose: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ groups, isCollapsed, onClose }) => {
  return (
    <nav
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden py-5 space-y-5",
        isCollapsed ? "lg:px-2 px-3" : "px-3"
      )}
    >
      {groups.map((group, groupIdx) => (
        <div
          key={group.label}
          className={cn(
            "space-y-1.5",
            isCollapsed && groupIdx > 0 && "lg:pt-1 lg:border-t lg:border-border"
          )}
        >
          <h2
            className={cn(
              "px-3.5 text-[12px] font-mono tracking-normal text-muted-foreground/60 uppercase",
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
                      "group relative flex items-center text-sm font-medium rounded-[6px] transition-all duration-200 focus-ring overflow-hidden",
                      isCollapsed
                        ? "lg:justify-center lg:px-0 lg:py-2.5 gap-3 px-3.5 py-2.5"
                        : "gap-3 px-3.5 py-2.5",
                      isActive
                        ? "bg-muted/40 text-foreground font-semibold before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-primary"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105" aria-hidden />
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
  );
};
