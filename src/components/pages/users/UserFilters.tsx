import React from "react";
import { Search } from "lucide-react";
import { cn } from "../../../lib/utils";

interface UserFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}) => {
  const presets = [
    { value: "all", label: "Total Users" },
    { value: "active_streak", label: "Active Streak" },
    { value: "has_purchases", label: "Has Purchases" },
    { value: "inactive_30_days", label: "Inactive 30d" },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card border border-border/60 p-4 rounded-xl shadow-xs select-none">
      {/* Search Input */}
      <div className="relative w-full md:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200"
          placeholder="Search full name or email..."
          aria-label="Search User Accounts"
        />
      </div>

      {/* Clickable Filter Pills Bar */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-widest mr-1">
          Filter:
        </span>
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onFilterChange(preset.value)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer",
              filter === preset.value
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground hover:text-foreground border-border hover:bg-accent"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserFilters;
