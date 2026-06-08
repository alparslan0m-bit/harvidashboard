import React from "react";
import { ArrowLeft, Plus } from "lucide-react";

interface CurriculumPanelHeaderWithBackProps {
  step: string;
  title: string;
  count: number;
  parentLabel?: string;
  addLabel: string;
  onBack: () => void;
  onAdd: () => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
}

export const CurriculumPanelHeaderWithBack: React.FC<CurriculumPanelHeaderWithBackProps> = ({
  step,
  title,
  count,
  parentLabel,
  addLabel,
  onBack,
  onAdd,
  searchQuery = "",
  onSearchChange,
  showSearch = false,
}) => (
  <div className="p-4 border-b space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg border border-border/80 hover:bg-muted text-muted-foreground transition shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {step}. {title}
            </h3>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
              {count}
            </span>
          </div>
          {parentLabel && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Under: <span className="font-semibold text-foreground">{parentLabel}</span>
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onAdd}
        className="p-1.5 rounded-md bg-primary text-white hover:bg-primary/95 transition flex items-center gap-1 text-[10px] font-bold"
        title="Press N to add"
        aria-label={addLabel}
      >
        <Plus className="h-3.5 w-3.5" />
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
