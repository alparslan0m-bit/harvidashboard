import React from "react";
import { FilterBar } from "@/components/shared/FilterBar";

export const DATE_PRESETS = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "1y", days: 365 },
] as const;

interface AnalyticsDateFilterProps {
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onPreset: (days: number) => void;
}

export const AnalyticsDateFilter: React.FC<AnalyticsDateFilterProps> = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onPreset,
}) => (
  <FilterBar className="flex-col sm:flex-row gap-4">
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Date Range</h3>
      <p className="text-[10px] text-muted-foreground">Modify reporting bounds for all charts</p>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      {DATE_PRESETS.map((preset) => (
        <button
          key={preset.label}
          onClick={() => onPreset(preset.days)}
          className="px-3 py-1.5 rounded-md border text-[11px] font-semibold text-muted-foreground hover:bg-accent transition"
        >
          {preset.label}
        </button>
      ))}
      <span className="text-xs text-muted-foreground mx-1">|</span>
      <input type="date" value={fromDate} onChange={(e) => onFromDateChange(e.target.value)} className="rounded-md border border-input bg-background px-3 py-1.5 text-xs outline-none" aria-label="Start Date" />
      <span className="text-xs text-muted-foreground">to</span>
      <input type="date" value={toDate} onChange={(e) => onToDateChange(e.target.value)} className="rounded-md border border-input bg-background px-3 py-1.5 text-xs outline-none" aria-label="End Date" />
    </div>
  </FilterBar>
);
