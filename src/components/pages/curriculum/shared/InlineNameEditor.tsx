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
  <div className={compact ? "p-2 border rounded-lg flex gap-2 items-center bg-muted/10" : "p-3 bg-muted/40 border-b flex gap-2 items-center"}>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 rounded-md border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
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
      className={`rounded bg-zinc-300 dark:bg-zinc-800 text-foreground hover:bg-muted transition ${compact ? "p-1" : "p-1.5"}`}
      aria-label="Cancel"
    >
      <X className={compact ? "h-3.5 w-3.5" : "h-3 w-3"} />
    </button>
  </div>
);
