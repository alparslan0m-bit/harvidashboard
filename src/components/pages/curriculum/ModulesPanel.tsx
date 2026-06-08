import React, { useState, useCallback } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useModules } from "@/hooks/curriculum";
import { buildReorderPayload } from "@/utils/reorder";
import type { ModuleWithCount } from "@/types/curriculum";
import { formatCurrency } from "@/lib/utils";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import { CurriculumPanelShell } from "./shared/CurriculumPanelShell";
import { CurriculumPanelHeaderWithBack } from "./shared/CurriculumPanelHeaderWithBack";
import { SortableCurriculumRow } from "./shared/SortableCurriculumRow";
import {
  PricingFormOverlay,
  emptyPricingForm,
  moduleToPricingForm,
  pricingFormToPayload,
  type PricingFormState,
} from "./shared/PricingFormFields";
import { useSortableSensors } from "./shared/useSortableSensors";
import { usePanelKeyboard } from "./shared/usePanelKeyboard";

interface ModulesPanelProps {
  selectedYearId: string | null;
  yearName?: string;
  onSelectModule: (id: string) => void;
  onBack: () => void;
}

export const ModulesPanel: React.FC<ModulesPanelProps> = ({
  selectedYearId,
  yearName,
  onSelectModule,
  onBack,
}) => {
  const { modules, isLoadingModules, createModule, updateModule, deleteModule, reorderModules } =
    useModules(selectedYearId);
  const sensors = useSortableSensors();

  const [form, setForm] = useState<PricingFormState>(emptyPricingForm());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const openCreate = useCallback(() => {
    setEditingId(null);
    setForm(emptyPricingForm());
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((mod: ModuleWithCount) => {
    setEditingId(mod.id);
    setForm(moduleToPricingForm(mod));
    setIsFormOpen(true);
  }, []);

  usePanelKeyboard({
    isFocused,
    isCreating: isFormOpen && !editingId,
    isEditing: isFormOpen && !!editingId,
    focusedId,
    items: modules,
    onCreate: openCreate,
    onEdit: openEdit,
    onDelete: setDeleteId,
    onSelect: onSelectModule,
    onCancelCreate: () => setIsFormOpen(false),
    onCancelEdit: () => setIsFormOpen(false),
    onClearFocus: onBack,
  });

  if (!selectedYearId) {
    return (
      <div className="flex flex-col border border-border rounded-xl bg-card shadow-sm h-[380px] p-5 justify-center">
        <EmptyState icon="Calendar" title="Select Academic Year" description="Choose a year to manage modules." />
      </div>
    );
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const payload = buildReorderPayload(modules, active.id, over.id);
    if (payload.length) await reorderModules(payload);
  };

  return (
    <CurriculumPanelShell
      isFocused={isFocused}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsFocused(false); }}
    >
      <CurriculumPanelHeaderWithBack
        step="2"
        title="Modules"
        count={modules.length}
        parentLabel={yearName}
        addLabel="Add Module"
        onBack={onBack}
        onAdd={openCreate}
      />

      {isFormOpen && (
        <PricingFormOverlay
          title={editingId ? "Edit Module Properties" : "Create New Module"}
          form={form}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          onSave={async () => {
            if (!form.name.trim()) return;
            const payload = pricingFormToPayload(form);
            if (editingId) await updateModule({ id: editingId, ...payload });
            else await createModule(payload);
            setIsFormOpen(false);
          }}
          onCancel={() => setIsFormOpen(false)}
          namePlaceholder="e.g. Cardiology"
        />
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoadingModules ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted rounded-lg border" />)}
          </div>
        ) : modules.length === 0 ? (
          <EmptyState icon="BookOpen" title="No modules yet" description="Create your first module inside this academic level." />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {modules.map((mod) => (
                  <SortableCurriculumRow
                    key={mod.id}
                    id={mod.id}
                    name={mod.name}
                    subtitle={`${mod.subjectsCount} subjects${mod.is_free ? " · Free" : ` · ${formatCurrency(mod.price_cents)}`}`}
                    isFocused={focusedId === mod.id}
                    onFocus={() => setFocusedId(mod.id)}
                    onSelect={() => onSelectModule(mod.id)}
                    onEdit={() => openEdit(mod)}
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
        onConfirm={async () => {
          if (deleteId) {
            await deleteModule(deleteId);
            if (focusedId === deleteId) setFocusedId(null);
            setDeleteId(null);
          }
        }}
        title="Delete Course Module?"
        description="You can only delete modules with no child subjects."
        confirmText="Delete Module"
        variant="destructive"
      />
    </CurriculumPanelShell>
  );
};

export default ModulesPanel;
