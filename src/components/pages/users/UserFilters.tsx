import React from "react";
import { Search } from "lucide-react";
import { cn } from "../../../lib/utils";
import { USER_FILTER_OPTIONS } from "../../../lib/constants";

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
  return (
    <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-muted/30 border border-border px-4 py-3 rounded-xl shadow-sm select-none">
      {/* Search Input */}
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200"
          placeholder="Search full name or email..."
          aria-label="Search User Accounts"
        />
      </div>

      {/* Clickable Filter Pills Bar */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <span className="text-sm uppercase font-semibold text-foreground/70 tracking-wide mr-1">
          Filter:
        </span>
        {USER_FILTER_OPTIONS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onFilterChange(preset.value)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 cursor-pointer",
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
