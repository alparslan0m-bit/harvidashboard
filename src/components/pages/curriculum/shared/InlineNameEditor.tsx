import React from "react";
import { Check, X } from "lucide-react";

interface InlineNameEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder: string;
  ariaLabel: string;
  compact?: boolean;
}

export const InlineNameEditor: React.FC<InlineNameEditorProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  placeholder,
  ariaLabel,
  compact = false,
}) => (
  <div
      className={
      compact
        ? "px-5 py-3.5 border-b flex gap-2 items-center bg-card animate-in fade-in slide-in-from-top-1 duration-200"
        : "px-5 py-3.5 border-b flex gap-2 items-center bg-muted/20 animate-in fade-in slide-in-from-top-1 duration-200"
    }
  >
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 rounded-[6px] border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground outline-none focus-visible:ring-1 focus-visible:ring-foreground/30"
      placeholder={placeholder}
      aria-label={ariaLabel}
      autoFocus
      onKeyDown={(e) => e.key === "Enter" && onSave()}
    />
    <button
      onClick={onSave}
      className={`rounded-[6px] bg-foreground text-background hover:bg-foreground/90 transition ${compact ? "p-1.5" : "p-1.5"}`}
      aria-label="Save"
    >
      <Check className={compact ? "h-3.5 w-3.5" : "h-3 w-3"} />
    </button>
    <button
      onClick={onCancel}
      className={`rounded-[6px] border border-border bg-card text-foreground hover:bg-muted transition ${compact ? "p-1.5" : "p-1.5"}`}
      aria-label="Cancel"
    >
      <X className={compact ? "h-3.5 w-3.5" : "h-3 w-3"} />
    </button>
  </div>
);
