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
      "relative overflow-hidden flex flex-col border rounded-xl bg-card shadow-sm outline-none transition-all duration-200 w-full min-h-[420px]",
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
  addLabel,
  onAdd,
}) => (
  <div className="px-4 py-3 border-b bg-muted/30 space-y-2">
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
            {step}. {title}
          </h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            {count}
          </span>
        </div>
      </div>
      <button
        onClick={onAdd}
        className="px-3 py-1.5 rounded-md bg-primary text-white hover:bg-primary/95 transition flex items-center gap-1 text-sm font-bold"
        title="Press N to add"
        aria-label={addLabel}
      >
        <span>{addLabel}</span>
      </button>
    </div>
  </div>
);
