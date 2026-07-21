import React, { useState, useMemo, useCallback } from "react";
import { Eye, Lock, Unlock } from "lucide-react";
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
  const [isFree, setIsFree] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const openCreate = useCallback(() => {
    setEditingId(null);
    setLectureName("");
    setIsFree(false);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((lect: Lecture) => {
    setEditingId(lect.id);
    setLectureName(lect.name);
    setIsFree(!!lect.is_free);
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

  const saveLecture = async () => {
    if (!lectureName.trim()) return;
    if (editingId) {
      await updateLecture({ id: editingId, name: lectureName.trim(), is_free: isFree });
    } else {
      await createLecture({ subjectId: selectedSubjectId, name: lectureName.trim(), is_free: isFree });
    }
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
      />

      {isFormOpen && (
        <div className="p-3 border-b border-border bg-muted/40 space-y-3">
          <input
            type="text"
            value={lectureName}
            onChange={(e) => setLectureName(e.target.value)}
            placeholder="e.g. Heart Murmurs"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") saveLecture();
              if (e.key === "Escape") setIsFormOpen(false);
            }}
            aria-label="Lecture name"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <span className="flex items-center gap-1">
                {isFree ? <Unlock className="h-3.5 w-3.5 text-emerald-500" /> : <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                Free Preview Lecture
              </span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-3 py-1 text-xs rounded border border-input hover:bg-accent text-foreground transition font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveLecture}
                className="px-3 py-1 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 transition font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {lectures.length === 0 ? (
          <EmptyState icon="FileText" title="No lectures yet" description="Add lectures to this subject." />
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
            <SortableContext items={lectures.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <div>
                {lectures.map((lect) => {
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
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await updateLecture({ id: lect.id, is_free: !lect.is_free });
                            }}
                            className={`px-2 py-0.5 text-xs rounded font-bold transition flex items-center gap-1 ${
                              lect.is_free
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                                : "bg-muted text-muted-foreground hover:bg-accent border border-border"
                            }`}
                            title={lect.is_free ? "Free Preview (Click to Lock)" : "Paid Only (Click to make Free Preview)"}
                          >
                            {lect.is_free ? (
                              <>
                                <Unlock className="h-3 w-3" />
                                <span>FREE</span>
                              </>
                            ) : (
                              <>
                                <Lock className="h-3 w-3" />
                                <span>LOCKED</span>
                              </>
                            )}
                          </button>

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
                        </div>
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
