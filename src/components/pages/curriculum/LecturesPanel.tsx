import React, { useState, useMemo, useCallback } from "react";
import { Eye } from "lucide-react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSubjectsAndLectures, useLectureQuestionCounts } from "@/hooks/curriculum";
import { buildReorderPayload } from "@/utils/reorder";
import type { Lecture } from "@/types/database";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import { CurriculumPanelShell } from "./shared/CurriculumPanelShell";
import { CurriculumPanelHeaderWithBack } from "./shared/CurriculumPanelHeaderWithBack";
import { SortableCurriculumRow } from "./shared/SortableCurriculumRow";
import { InlineNameEditor } from "./shared/InlineNameEditor";
import { useSortableSensors } from "./shared/useSortableSensors";
import { usePanelKeyboard } from "./shared/usePanelKeyboard";

interface LecturesPanelProps {
  selectedModuleId: string;
  selectedSubjectId: string;
  subjectName: string;
  onBack: () => void;
  onSelectLecture: (id: string, name: string) => void;
}

export const LecturesPanel: React.FC<LecturesPanelProps> = ({
  selectedModuleId,
  selectedSubjectId,
  subjectName,
  onBack,
  onSelectLecture,
}) => {
  const { subjects, createLecture, updateLecture, deleteLecture, reorderLectures } =
    useSubjectsAndLectures(selectedModuleId);
  const sensors = useSortableSensors();

  const activeSubject = useMemo(() => subjects.find((s) => s.id === selectedSubjectId), [subjects, selectedSubjectId]);
  const lectures = useMemo(() => activeSubject?.lectures ?? [], [activeSubject]);
  const lectureIds = useMemo(() => lectures.map((l) => l.id), [lectures]);
  const { counts: questionCounts } = useLectureQuestionCounts(lectureIds);

  const [lectureName, setLectureName] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const openCreate = useCallback(() => {
    setEditingId(null);
    setLectureName("");
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((lect: Lecture) => {
    setEditingId(lect.id);
    setLectureName(lect.name);
    setIsFormOpen(true);
  }, []);

  usePanelKeyboard({
    isFocused,
    isCreating: isFormOpen && !editingId,
    isEditing: isFormOpen && !!editingId,
    focusedId,
    items: lectures,
    onCreate: openCreate,
    onEdit: openEdit,
    onDelete: setDeleteId,
    onSelect: (id) => {
      const lect = lectures.find((l) => l.id === id);
      if (lect) onSelectLecture(id, lect.name);
    },
    onCancelCreate: () => setIsFormOpen(false),
    onCancelEdit: () => setIsFormOpen(false),
    onClearFocus: onBack,
  });

  const filtered = lectures.filter((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const saveLecture = async () => {
    if (!lectureName.trim()) return;
    if (editingId) await updateLecture({ id: editingId, name: lectureName.trim() });
    else await createLecture({ subjectId: selectedSubjectId, name: lectureName.trim() });
    setIsFormOpen(false);
  };

  return (
    <CurriculumPanelShell
      isFocused={isFocused}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsFocused(false); }}
    >
      <CurriculumPanelHeaderWithBack
        step="4"
        title="Lectures"
        count={lectures.length}
        parentLabel={subjectName}
        addLabel="Add Lecture"
        onBack={onBack}
        onAdd={openCreate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSearch={lectures.length > 0}
      />

      {isFormOpen && (
        <InlineNameEditor
          value={lectureName}
          onChange={setLectureName}
          onSave={saveLecture}
          onCancel={() => setIsFormOpen(false)}
          placeholder="e.g. Heart Murmurs"
          ariaLabel="Lecture name"
        />
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {lectures.length === 0 ? (
          <EmptyState icon="FileText" title="No lectures yet" description="Add lectures to this subject." />
        ) : filtered.length === 0 ? (
          <p className="text-center py-8 text-[11px] text-muted-foreground">No lectures match your search.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={async (event: DragEndEvent) => {
              const { active, over } = event;
              if (!over || active.id === over.id) return;
              const payload = buildReorderPayload(lectures, active.id, over.id);
              if (payload.length) await reorderLectures(payload);
            }}
          >
            <SortableContext items={filtered.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {filtered.map((lect) => {
                  const qCount = questionCounts.get(lect.id) ?? 0;
                  return (
                    <SortableCurriculumRow
                      key={lect.id}
                      id={lect.id}
                      name={lect.name}
                      subtitle={`${qCount} ${qCount === 1 ? "question" : "questions"}`}
                      isFocused={focusedId === lect.id}
                      onFocus={() => setFocusedId(lect.id)}
                      onSelect={() => onSelectLecture(lect.id, lect.name)}
                      onEdit={() => openEdit(lect)}
                      onDelete={() => setDeleteId(lect.id)}
                      trailing={
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLecture(lect.id, lect.name);
                          }}
                          className="p-1.5 rounded hover:bg-muted text-primary transition opacity-0 group-hover:opacity-100"
                          title="Preview questions"
                          aria-label="View Lecture Questions"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      }
                    />
                  );
                })}
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
            await deleteLecture(deleteId);
            if (focusedId === deleteId) setFocusedId(null);
            setDeleteId(null);
          }
        }}
        title="Delete Lecture?"
        description="You can only delete lectures with no associated questions."
        confirmText="Delete Lecture"
        variant="destructive"
      />
    </CurriculumPanelShell>
  );
};

export default LecturesPanel;
