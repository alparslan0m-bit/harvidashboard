import React, { useState, useCallback } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useYears } from "@/hooks/curriculum";
import { buildReorderPayload } from "@/utils/reorder";
import type { YearWithCount } from "@/types/curriculum";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import { CurriculumPanelShell, CurriculumPanelHeader } from "./shared/CurriculumPanelShell";
import { InlineNameEditor } from "./shared/InlineNameEditor";
import { SortableCurriculumRow } from "./shared/SortableCurriculumRow";
import { useSortableSensors } from "./shared/useSortableSensors";
import { usePanelKeyboard } from "./shared/usePanelKeyboard";

interface YearsPanelProps {
  onSelectYear: (id: string) => void;
}

export const YearsPanel: React.FC<YearsPanelProps> = ({ onSelectYear }) => {
  const { years, createYear, updateYear, deleteYear, reorderYears } = useYears();
  const sensors = useSortableSensors();

  const [newYearName, setNewYearName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [focusedYearId, setFocusedYearId] = useState<string | null>(null);

  const startEdit = useCallback((year: YearWithCount) => {
    setEditingId(year.id);
    setEditingName(year.name);
  }, []);

  usePanelKeyboard({
    isFocused,
    isCreating,
    isEditing: !!editingId,
    focusedId: focusedYearId,
    items: years,
    onCreate: () => setIsCreating(true),
    onEdit: startEdit,
    onDelete: setDeleteId,
    onSelect: onSelectYear,
    onCancelCreate: () => setIsCreating(false),
    onCancelEdit: () => setEditingId(null),
    onClearFocus: () => setFocusedYearId(null),
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const payload = buildReorderPayload(years, active.id, over.id);
    if (payload.length) await reorderYears(payload);
  };

  return (
    <CurriculumPanelShell
      isFocused={isFocused}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsFocused(false);
      }}
    >
      <CurriculumPanelHeader
        step="1"
        title="Academic Years"
        count={years.length}
        description="Specify general degrees & levels. Double click an item or click its title to drill down."
        addLabel="Add Year"
        onAdd={() => setIsCreating(true)}
      />

      {isCreating && (
        <InlineNameEditor
          value={newYearName}
          onChange={setNewYearName}
          onSave={async () => {
            if (!newYearName.trim()) return;
            await createYear(newYearName.trim());
            setNewYearName("");
            setIsCreating(false);
          }}
          onCancel={() => setIsCreating(false)}
          placeholder="e.g. Year 1"
          ariaLabel="New Year Name"
        />
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {years.length === 0 ? (
          <EmptyState
            icon="Calendar"
            title="No academic years yet"
            description="Create your first academic year level to start building the curriculum tree."
          />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={years.map((y) => y.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {years.map((year) =>
                  editingId === year.id ? (
                    <InlineNameEditor
                      key={year.id}
                      compact
                      value={editingName}
                      onChange={setEditingName}
                      onSave={async () => {
                        if (!editingId || !editingName.trim()) return;
                        await updateYear({ id: editingId, name: editingName.trim() });
                        setEditingId(null);
                        setEditingName("");
                      }}
                      onCancel={() => setEditingId(null)}
                      placeholder=""
                      ariaLabel="Edit Year Name"
                    />
                  ) : (
                    <SortableCurriculumRow
                      key={year.id}
                      id={year.id}
                      name={year.name}
                      subtitle={`${year.modulesCount} ${year.modulesCount === 1 ? "module" : "modules"}`}
                      isFocused={focusedYearId === year.id}
                      onFocus={() => setFocusedYearId(year.id)}
                      onSelect={() => onSelectYear(year.id)}
                      onEdit={() => startEdit(year)}
                      onDelete={() => setDeleteId(year.id)}
                    />
                  ),
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await deleteYear(deleteId);
            if (focusedYearId === deleteId) setFocusedYearId(null);
            setDeleteId(null);
          }
        }}
        title="Delete Academic Year?"
        description="This will permanently delete this academic level. You can only perform this action if it has no child modules."
        confirmText="Delete Year"
        variant="destructive"
      />
    </CurriculumPanelShell>
  );
};

export default YearsPanel;
