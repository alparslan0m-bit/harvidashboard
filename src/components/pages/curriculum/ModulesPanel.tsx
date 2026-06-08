import React, { useState, useEffect } from "react";
import { useModules } from "../../../hooks/useCurriculum";
import { Plus, Edit2, Trash2, GripVertical } from "lucide-react";
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
import { cn, formatCurrency } from "../../../lib/utils";
import { ConfirmDialog } from "../../shared/ConfirmDialog";

interface ModulesPanelProps {
  selectedYearId: string | null;
  selectedModuleId: string | null;
  onSelectModule: (id: string | null) => void;
}

interface SortableModuleItemProps {
  id: string;
  name: string;
  isFree: boolean;
  priceCents: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const SortableModuleItem: React.FC<SortableModuleItemProps> = React.memo(({
  id,
  name,
  isFree,
  priceCents,
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

        <div className="min-w-0 flex-1">
          <button
            onClick={onSelect}
            className="text-xs font-semibold truncate text-left w-full hover:underline focus:outline-none block"
          >
            {name}
          </button>
          <span className="text-[10px] text-muted-foreground">
            {isFree ? "Free" : formatCurrency(priceCents)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 rounded hover:bg-muted text-muted-foreground transition"
          aria-label="Edit module"
        >
          <Edit2 className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded hover:bg-destructive/10 text-destructive transition"
          aria-label="Delete module"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
});

SortableModuleItem.displayName = "SortableModuleItem";

export const ModulesPanel: React.FC<ModulesPanelProps> = ({
  selectedYearId,
  selectedModuleId,
  onSelectModule,
}) => {
  const {
    modules,
    isLoadingModules,
    createModule,
    updateModule,
    deleteModule,
    reorderModules,
  } = useModules(selectedYearId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formName, setFormName] = useState("");
  const [formIsFree, setFormIsFree] = useState(true);
  const [formPriceDollars, setFormPriceDollars] = useState("0");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Keyboard shortcut: N to create new item when focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) return;
      const activeElement = document.activeElement;
      const isTyping = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
      if (e.key?.toLowerCase() === "n" && !isFormOpen && !editingId && !isTyping) {
        e.preventDefault();
        handleOpenCreate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused, isFormOpen, editingId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = modules.findIndex((m: any) => m.id === active.id);
    const newIndex = modules.findIndex((m: any) => m.id === over.id);

    const reordered = arrayMove(modules, oldIndex, newIndex);
    const payload = reordered.map((item: any, idx: number) => ({
      id: item.id,
      order_index: idx,
    }));

    await reorderModules(payload);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormName("");
    setFormIsFree(true);
    setFormPriceDollars("0");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (mod: any) => {
    setEditingId(mod.id);
    setFormName(mod.name);
    setFormIsFree(mod.is_free);
    setFormPriceDollars(String(mod.price_cents / 100));
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    const priceCents = Math.round(parseFloat(formPriceDollars || "0") * 100);

    const payload = {
      name: formName.trim(),
      is_free: formIsFree,
      price_cents: priceCents,
    };

    if (editingId) {
      await updateModule({ id: editingId, ...payload });
    } else {
      await createModule(payload);
    }

    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteModule(deleteId);
      if (selectedModuleId === deleteId) {
        onSelectModule(null);
      }
      setDeleteId(null);
    }
  };

  if (!selectedYearId) {
    return (
      <div className="flex flex-col border border-border/60 rounded-xl bg-card shadow-sm h-[600px] items-center justify-center p-6 text-center select-none text-muted-foreground text-xs">
        Select an academic year to display modules.
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
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
            2. Modules ({modules.length})
          </h3>
          <p className="text-[10px] text-muted-foreground">Academic courses inside this year</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="p-1.5 rounded-md bg-primary text-white hover:bg-primary/95 transition flex items-center gap-1 text-[10px] font-bold"
          aria-label="Add Module"
        >
          <Plus className="h-3 w-3" />
          <span>Add</span>
        </button>
      </div>

      {/* Module Editor form overlay inside the list box */}
      {isFormOpen && (
        <div className="p-4 bg-muted/30 border-b space-y-3">
          <h4 className="text-xs font-bold text-foreground">
            {editingId ? "Edit Module Properties" : "Create New Module"}
          </h4>

          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-semibold">Module Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full rounded-md border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. Cardiology"
              aria-label="Module Name"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-[10px] text-muted-foreground font-semibold">Free Module</label>
            <input
              type="checkbox"
              checked={formIsFree}
              onChange={(e) => setFormIsFree(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              aria-label="Is Module Free"
            />
          </div>

          {!formIsFree && (
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-semibold">Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formPriceDollars}
                onChange={(e) => setFormPriceDollars(e.target.value)}
                className="w-full rounded-md border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                placeholder="9.99"
                aria-label="Module Price in USD"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!formName.trim()}
              className="flex-1 px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-500 transition disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setIsFormOpen(false)}
              className="flex-1 px-3 py-1.5 bg-zinc-300 dark:bg-zinc-800 text-foreground rounded text-xs font-semibold hover:bg-muted transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Module listings */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-2">
        {isLoadingModules ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-muted rounded-lg border"></div>
            ))}
          </div>
        ) : modules.length === 0 ? (
          <p className="text-center py-8 text-[11px] text-muted-foreground">No modules created yet.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {modules.map((mod) => (
                  <SortableModuleItem
                    key={mod.id}
                    id={mod.id}
                    name={mod.name}
                    isFree={mod.is_free}
                    priceCents={mod.price_cents}
                    isSelected={selectedModuleId === mod.id}
                    onSelect={() => onSelectModule(mod.id)}
                    onEdit={() => handleOpenEdit(mod)}
                    onDelete={() => setDeleteId(mod.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Course Module?"
        description="This will permanently delete this module from the academic track. You can only perform this action if it has no child subjects."
        confirmText="Delete Module"
        variant="destructive"
      />
    </div>
  );
};

export default ModulesPanel;
