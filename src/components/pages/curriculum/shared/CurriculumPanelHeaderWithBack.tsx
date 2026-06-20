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
}

export const CurriculumPanelHeaderWithBack: React.FC<CurriculumPanelHeaderWithBackProps> = ({
  step,
  title,
  count,
  parentLabel: _parentLabel,
  addLabel,
  onBack,
  onAdd,
}) => (
  <div className="px-4 py-3 border-b bg-muted/30 space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground transition shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
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
      </div>
      <button
        onClick={onAdd}
        className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/95 transition flex items-center gap-1 text-sm font-bold"
        title="Press N to add"
        aria-label={addLabel}
      >
        <Plus className="h-4 w-4" />
        <span>{addLabel}</span>
      </button>
    </div>
  </div>
);
