import React from "react";
import { cn } from "@/lib/utils";

interface CurriculumPanelShellProps {
  isFocused: boolean;
  onFocus: () => void;
  onBlur: (e: React.FocusEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
  className?: string;
}

export const CurriculumPanelShell: React.FC<CurriculumPanelShellProps> = ({
  isFocused,
  onFocus,
  onBlur,
  children,
  className,
}) => (
  <div
    tabIndex={0}
    onFocus={onFocus}
    onBlur={onBlur}
    className={cn(
      "flex flex-col border rounded-xl bg-card shadow-sm outline-none transition-all duration-200 w-full min-h-[500px]",
      isFocused ? "ring-1 ring-primary/20 border-primary/30" : "border-border/60",
      className,
    )}
  >
    {children}
  </div>
);

interface CurriculumPanelHeaderProps {
  step: string;
  title: string;
  count: number;
  description: string;
  addLabel: string;
  onAdd: () => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
}

export const CurriculumPanelHeader: React.FC<CurriculumPanelHeaderProps> = ({
  step,
  title,
  count,
  description,
  addLabel,
  onAdd,
  searchQuery = "",
  onSearchChange,
  showSearch = false,
}) => (
  <div className="p-4 border-b space-y-3">
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            {step}. {title}
          </h3>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
            {count}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        onClick={onAdd}
        className="p-1.5 rounded-md bg-primary text-white hover:bg-primary/95 transition flex items-center gap-1 text-[10px] font-bold"
        title="Press N to add"
        aria-label={addLabel}
      >
        <span>{addLabel}</span>
      </button>
    </div>
    {showSearch && onSearchChange && (
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={`Search ${title.toLowerCase()}...`}
        className="w-full rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition"
      />
    )}
  </div>
);
