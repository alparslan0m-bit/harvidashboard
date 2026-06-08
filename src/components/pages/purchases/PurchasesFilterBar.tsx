import React from "react";
import { FilterBar } from "@/components/shared/FilterBar";
import { Search } from "lucide-react";

interface PurchasesFilterBarProps {
  status: string;
  fromDate: string;
  toDate: string;
  searchSessionId: string;
  providers: string[];
  onStatusChange: (val: string) => void;
  onFromDateChange: (val: string) => void;
  onToDateChange: (val: string) => void;
  onSearchChange: (val: string) => void;
  onProviderSelect: (val: string) => void;
}

export const PurchasesFilterBar: React.FC<PurchasesFilterBarProps> = ({
  status,
  fromDate,
  toDate,
  searchSessionId,
  providers,
  onStatusChange,
  onFromDateChange,
  onToDateChange,
  onSearchChange,
  onProviderSelect,
}) => (
  <FilterBar className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
    <div className="space-y-1">
      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">
        Status
      </label>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none transition"
        aria-label="Filter status dropdown"
      >
        <option value="all">All Transactions</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="failed">Failed</option>
        <option value="refunded">Refunded</option>
        <option value="disputed">Disputed</option>
      </select>
    </div>

    <div className="space-y-1">
      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">
        Provider
      </label>
      <select
        value=""
        onChange={(e) => {
          if (e.target.value) {
            onProviderSelect(e.target.value);
          }
        }}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none transition"
        aria-label="Filter provider dropdown"
      >
        <option value="">All Providers</option>
        {providers.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>

    <div className="space-y-1">
      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">
        From Date
      </label>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => onFromDateChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none transition"
        aria-label="Start date filter picker"
      />
    </div>

    <div className="space-y-1">
      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">
        To Date
      </label>
      <input
        type="date"
        value={toDate}
        onChange={(e) => onToDateChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none transition"
        aria-label="End date filter picker"
      />
    </div>

    <div className="space-y-1">
      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">
        Search Session ID
      </label>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          value={searchSessionId}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-xs text-foreground outline-none transition"
          placeholder="Session ID or ref..."
          aria-label="Search Session ID"
        />
      </div>
    </div>
  </FilterBar>
);
