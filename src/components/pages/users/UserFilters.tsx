import React from "react";
import { Search } from "lucide-react";

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
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border p-4 rounded-xl shadow-sm select-none">
      {/* Search Bar */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
          placeholder="Search full name or email..."
          aria-label="Search User Accounts"
        />
      </div>

      {/* Dropdown Filters */}
      <div className="w-full sm:w-auto">
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition capitalize"
          aria-label="Filter User Accounts"
        >
          <option value="all">All Users</option>
          <option value="has_purchases">Has Purchases</option>
          <option value="active_streak">Active Streak</option>
          <option value="inactive_30_days">No activity (30 days)</option>
        </select>
      </div>
    </div>
  );
};
export default UserFilters;
