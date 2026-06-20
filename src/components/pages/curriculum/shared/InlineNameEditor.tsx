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
        ? "p-2 border rounded-lg flex gap-2 items-center bg-muted/10 animate-in fade-in slide-in-from-top-1 duration-200"
        : "p-3 bg-muted/40 border-b flex gap-2 items-center animate-in fade-in slide-in-from-top-1 duration-200"
    }
  >
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
      placeholder={placeholder}
      aria-label={ariaLabel}
      autoFocus
      onKeyDown={(e) => e.key === "Enter" && onSave()}
    />
    <button
      onClick={onSave}
      className={`rounded bg-emerald-600 text-white hover:bg-emerald-500 transition ${compact ? "p-1" : "p-1.5"}`}
      aria-label="Save"
    >
      <Check className={compact ? "h-3.5 w-3.5" : "h-3 w-3"} />
    </button>
    <button
      onClick={onCancel}
      className={`rounded-lg bg-muted text-foreground hover:bg-muted/80 transition ${compact ? "p-1" : "p-1.5"}`}
      aria-label="Cancel"
    >
      <X className={compact ? "h-3.5 w-3.5" : "h-3 w-3"} />
    </button>
  </div>
);
