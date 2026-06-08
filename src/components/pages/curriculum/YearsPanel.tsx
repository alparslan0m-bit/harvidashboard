import React, { useState, useEffect } from "react";
import { useCurriculum } from "../../../hooks/useCurriculum";
import { Plus, Edit2, Trash2, GripVertical, Check, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "../../../lib/utils";
import { ConfirmDialog } from "../../shared/ConfirmDialog";

interface YearsPanelProps {
  selectedYearId: string | null;
  onSelectYear: (id: string | null) => void;
}

interface SortableItemProps {
  id: string;
  name: string;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const SortableYearItem: React.FC<SortableItemProps> = React.memo(({
  id,
  name,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between border rounded-lg p-3 select-none transition-colors group",
        isSelected
          ? "border-primary/40 bg-primary/8 text-primary font-semibold"
          : "border-border bg-card hover:bg-muted/10",
        isDragging && "z-50 shadow-md border-primary"
      )}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-1 rounded hover:bg-muted text-muted-foreground/60 cursor-grab active:cursor-grabbing shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          onClick={onSelect}
          className="text-xs font-semibold truncate text-left w-full hover:underline focus:outline-none"
        >
          {name}
        </button>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 rounded hover:bg-muted text-muted-foreground transition"
          aria-label="Edit year name"
        >
          <Edit2 className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded hover:bg-destructive/10 text-destructive transition"
          aria-label="Delete year"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
});

SortableYearItem.displayName = "SortableYearItem";

export const YearsPanel: React.FC<YearsPanelProps> = ({
  selectedYearId,
  onSelectYear,
}) => {
  const { years, createYear, updateYear, deleteYear, reorderYears } = useCurriculum();
  
  const [newYearName, setNewYearName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Keyboard shortcut: N to create new item when focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) return;
      // Trigger if user presses N/n key and not typing in input
      const activeElement = document.activeElement;
      const isTyping = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
      if (e.key?.toLowerCase() === "n" && !isCreating && !editingId && !isTyping) {
        e.preventDefault();
        setIsCreating(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused, isCreating, editingId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = years.findIndex((y: any) => y.id === active.id);
    const newIndex = years.findIndex((y: any) => y.id === over.id);

    const reordered = arrayMove(years, oldIndex, newIndex);
    const payload = reordered.map((item: any, idx: number) => ({
      id: item.id,
      order_index: idx,
    }));

    await reorderYears(payload);
  };

  const handleCreate = async () => {
    if (!newYearName.trim()) return;
    await createYear(newYearName.trim());
    setNewYearName("");
    setIsCreating(false);
  };

  const handleUpdate = async () => {
    if (!editingId || !editingName.trim()) return;
    await updateYear({ id: editingId, name: editingName.trim() });
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteYear(deleteId);
      if (selectedYearId === deleteId) {
        onSelectYear(null);
      }
      setDeleteId(null);
    }
  };

  return (
    <div
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        // Only lose focus if moving outside the component
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsFocused(false);
        }
      }}
      className={cn(
        "flex flex-col border rounded-xl bg-card shadow-sm h-[600px] select-none outline-none transition-all duration-200",
        isFocused ? "ring-1 ring-primary/20 border-primary/30" : "border-border/60"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            1. Academic Years ({years.length})
          </h3>
          <p className="text-[10px] text-muted-foreground">Specify the general degrees/levels</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1.5 rounded-md bg-primary text-white hover:bg-primary/95 transition flex items-center gap-1 text-[10px] font-bold"
          aria-label="Add Year"
        >
          <Plus className="h-3 w-3" />
          <span>Add</span>
        </button>
      </div>

      {/* Input row for creation */}
      {isCreating && (
        <div className="p-3 bg-muted/40 border-b flex gap-2 items-center">
          <input
            type="text"
            value={newYearName}
            onChange={(e) => setNewYearName(e.target.value)}
            className="flex-1 rounded-md border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. Year 1"
            aria-label="New Year Name"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button
            onClick={handleCreate}
            className="p-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-500 transition"
            aria-label="Save Year"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            onClick={() => setIsCreating(false)}
            className="p-1.5 rounded bg-zinc-300 dark:bg-zinc-800 text-foreground hover:bg-muted transition"
            aria-label="Cancel"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Year listings */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-2">
        {years.length === 0 ? (
          <p className="text-center py-8 text-[11px] text-muted-foreground">No years created yet.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={years.map((y) => y.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {years.map((year) =>
                  editingId === year.id ? (
                    <div key={year.id} className="p-2 border rounded-lg flex gap-2 items-center bg-muted/10">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 rounded border bg-background px-2.5 py-1 text-xs text-foreground outline-none"
                        aria-label="Edit Year Name"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                      />
                      <button
                        onClick={handleUpdate}
                        className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                        aria-label="Save Edit"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded bg-zinc-300 dark:bg-zinc-800 text-foreground hover:bg-muted"
                        aria-label="Cancel Edit"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <SortableYearItem
                      key={year.id}
                      id={year.id}
                      name={year.name}
                      isSelected={selectedYearId === year.id}
                      onSelect={() => onSelectYear(year.id)}
                      onEdit={() => {
                        setEditingId(year.id);
                        setEditingName(year.name);
                      }}
                      onDelete={() => setDeleteId(year.id)}
                    />
                  )
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Academic Year?"
        description="This will permanently delete this academic level. You can only perform this action if it has no child modules."
        confirmText="Delete Year"
        variant="destructive"
      />
    </div>
  );
};

export default YearsPanel;
