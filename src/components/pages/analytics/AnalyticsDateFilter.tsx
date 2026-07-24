import React, { useMemo } from "react";
import { FilterBar } from "@/components/shared/FilterBar";
import { Calendar, AlertCircle } from "lucide-react";

export const DATE_PRESETS = [
  { label: "7d", days: 7, name: "7 days" },
  { label: "14d", days: 14, name: "14 days" },
  { label: "30d", days: 30, name: "30 days" },
  { label: "90d", days: 90, name: "90 days" },
  { label: "1y", days: 365, name: "1 year" },
] as const;

interface AnalyticsDateFilterProps {
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onPreset: (days: number) => void;
  activePreset: number | null;
}

/** Format "2026-06-26" → "Jun 26, 2026" */
function formatReadableDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Count days between two ISO date strings (inclusive). */
function daysBetween(from: string, to: string): number {
  const msPerDay = 86_400_000;
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / msPerDay) + 1;
}

export const AnalyticsDateFilter: React.FC<AnalyticsDateFilterProps> = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onPreset,
  activePreset,
}) => {
  const isInvalid = fromDate && toDate && fromDate > toDate;
  const days = fromDate && toDate && !isInvalid ? daysBetween(fromDate, toDate) : null;

  const rangeSummary = useMemo(() => {
    if (isInvalid) return null;
    if (!fromDate || !toDate) return null;
    const matchedPreset = DATE_PRESETS.find((p) => p.days === activePreset);
    const label = matchedPreset ? matchedPreset.name : `${days} day${days !== 1 ? "s" : ""}`;
    return `${label} · ${formatReadableDate(fromDate)} – ${formatReadableDate(toDate)}`;
  }, [fromDate, toDate, activePreset, isInvalid, days]);

  return (
    <FilterBar className="flex-col sm:flex-row gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          <Calendar className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Date Range</h3>
          {rangeSummary && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{rangeSummary}</p>
          )}
          {isInvalid && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
              <AlertCircle className="h-3 w-3 shrink-0" />
              Start date must be before end date
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Preset buttons */}
        <div className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5 gap-0.5">
          {DATE_PRESETS.map((preset) => {
            const isActive = activePreset === preset.days;
            return (
              <button
                key={preset.label}
                onClick={() => onPreset(preset.days)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 focus-ring ${
                  isActive
                    ? "bg-gradient-to-r from-primary to-chart-5 text-primary-foreground shadow-[0_2px_10px_rgba(0,112,243,0.3)]"
                    : "text-muted-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-chart-5/10 hover:text-foreground"
                }`}
                aria-pressed={isActive}
                title={`Last ${preset.name}`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

        {/* Custom date inputs */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fromDate}
            max={toDate || undefined}
            onChange={(e) => onFromDateChange(e.target.value)}
            className={`rounded-md border bg-background px-3 py-1.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background ${
              isInvalid ? "border-destructive" : "border-input"
            }`}
            aria-label="Start Date"
          />
          <span className="text-xs text-muted-foreground font-medium">to</span>
          <input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => onToDateChange(e.target.value)}
            className={`rounded-md border bg-background px-3 py-1.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background ${
              isInvalid ? "border-destructive" : "border-input"
            }`}
            aria-label="End Date"
          />
        </div>
      </div>
    </FilterBar>
  );
};
