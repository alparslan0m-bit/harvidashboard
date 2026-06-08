import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit2, Trash2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SortableRowProps {
  id: string;
  name: string;
  subtitle?: string;
  isFocused: boolean;
  onFocus: () => void;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  trailing?: React.ReactNode;
}

export const SortableCurriculumRow: React.FC<SortableRowProps> = React.memo(({
  id,
  name,
  subtitle,
  isFocused,
  onFocus,
  onSelect,
  onEdit,
  onDelete,
  trailing,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      onClick={onFocus}
      onDoubleClick={onSelect}
      className={cn(
        "flex items-center justify-between border rounded-lg p-3.5 select-none transition-all duration-200 group cursor-pointer",
        isFocused
          ? "border-primary bg-primary/[0.02] shadow-sm border-l-[3px] border-l-primary"
          : "border-border/60 bg-card hover:bg-muted/30 hover:border-border",
        isDragging && "z-50 shadow-md border-primary scale-[1.01] rotate-[0.2deg]",
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded hover:bg-muted text-muted-foreground/60 cursor-grab active:cursor-grabbing shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1" onClick={onSelect}>
          <span className="text-sm font-semibold truncate block text-foreground group-hover:text-primary transition-colors">
            {name}
          </span>
          {subtitle && (
            <span className="text-[11px] text-muted-foreground font-medium block mt-0.5">{subtitle}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {trailing}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1 rounded hover:bg-muted text-muted-foreground transition"
            aria-label="Edit"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 rounded hover:bg-destructive/15 text-destructive transition"
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/45 group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
});

SortableCurriculumRow.displayName = "SortableCurriculumRow";
