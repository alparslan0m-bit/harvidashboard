import React, { useState, useCallback } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSubjectsAndLectures } from "@/hooks/curriculum";
import { buildReorderPayload } from "@/utils/reorder";
import type { SubjectWithLectures } from "@/types/curriculum";
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

interface SubjectsPanelProps {
  selectedModuleId: string | null;
  moduleName: string;
  onBack: () => void;
  onSelectSubject: (id: string) => void;
}

function subjectSubtitle(subj: SubjectWithLectures) {
  const count = subj.lectures?.length ?? 0;
  const price = subj.is_free ? "Free" : formatCurrency(subj.price_cents);
  return `${count} ${count === 1 ? "lecture" : "lectures"} · ${price}`;
}

export const SubjectsPanel: React.FC<SubjectsPanelProps> = ({
  selectedModuleId,
  moduleName,
  onBack,
  onSelectSubject,
}) => {
  const { subjects, createSubject, updateSubject, deleteSubject, reorderSubjects } =
    useSubjectsAndLectures(selectedModuleId);
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

  const openEdit = useCallback((subj: SubjectWithLectures) => {
    setEditingId(subj.id);
    setForm(moduleToPricingForm(subj));
    setIsFormOpen(true);
  }, []);

  usePanelKeyboard({
    isFocused,
    isCreating: isFormOpen && !editingId,
    isEditing: isFormOpen && !!editingId,
    focusedId,
    items: subjects,
    onCreate: openCreate,
    onEdit: openEdit,
    onDelete: setDeleteId,
    onSelect: onSelectSubject,
    onCancelCreate: () => setIsFormOpen(false),
    onCancelEdit: () => setIsFormOpen(false),
    onClearFocus: onBack,
  });

  if (!selectedModuleId) {
    return (
      <div className="flex flex-col border border-border rounded-xl bg-card shadow-sm h-[380px] p-5 justify-center">
        <EmptyState icon="BookOpen" title="Select Module" description="Choose a module to manage subjects." />
      </div>
    );
  }

  return (
    <CurriculumPanelShell
      isFocused={isFocused}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsFocused(false); }}
    >
      <CurriculumPanelHeaderWithBack
        step="3"
        title="Subjects"
        count={subjects.length}
        parentLabel={moduleName}
        addLabel="Add Subject"
        onBack={onBack}
        onAdd={openCreate}
      />

      {isFormOpen && (
        <PricingFormOverlay
          title={editingId ? "Edit Subject" : "Create Subject"}
          form={form}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          onSave={async () => {
            if (!form.name.trim()) return;
            const payload = pricingFormToPayload(form);
            if (editingId) await updateSubject({ id: editingId, ...payload });
            else await createSubject(payload);
            setIsFormOpen(false);
          }}
          onCancel={() => setIsFormOpen(false)}
          namePlaceholder="e.g. Cardiology"
        />
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {subjects.length === 0 ? (
          <EmptyState icon="Layers" title="No subjects yet" description="Create subjects inside this module." />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={async (event: DragEndEvent) => {
              const { active, over } = event;
              if (!over || active.id === over.id) return;
              const payload = buildReorderPayload(subjects, active.id, over.id);
              if (payload.length) await reorderSubjects(payload);
            }}
          >
            <SortableContext items={subjects.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {subjects.map((subj) => (
                  <SortableCurriculumRow
                    key={subj.id}
                    id={subj.id}
                    name={subj.name}
                    subtitle={subjectSubtitle(subj)}
                    isFocused={focusedId === subj.id}
                    onFocus={() => setFocusedId(subj.id)}
                    onSelect={() => onSelectSubject(subj.id)}
                    onEdit={() => openEdit(subj)}
                    onDelete={() => setDeleteId(subj.id)}
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
            await deleteSubject(deleteId);
            if (focusedId === deleteId) setFocusedId(null);
            setDeleteId(null);
          }
        }}
        title="Delete Subject?"
        description="You can only delete subjects with no child lectures."
        confirmText="Delete Subject"
        variant="destructive"
      />
    </CurriculumPanelShell>
  );
};

export default SubjectsPanel;
