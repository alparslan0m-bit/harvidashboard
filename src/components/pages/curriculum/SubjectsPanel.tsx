import React, { useState } from "react";
import { useSubjectsAndLectures } from "../../../hooks/useCurriculum";
import { Plus, Edit2, Trash2, GripVertical, ChevronDown, ChevronRight, Eye } from "lucide-react";
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

interface SubjectsPanelProps {
  selectedModuleId: string | null;
  onSelectLecture: (id: string | null, name: string) => void;
}

interface SortableSubjectItemProps {
  id: string;
  name: string;
  isFree: boolean;
  priceCents: number;
  lectures: any[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddLecture: () => void;
  onEditLecture: (lect: any) => void;
  onDeleteLecture: (lect: any) => void;
  onSelectLecture: (id: string, name: string) => void;
  onReorderLectures: (lecturesPayload: { id: string; order_index: number }[]) => void;
}

const SortableLectureItem: React.FC<{
  lecture: any;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
}> = ({ lecture, onEdit, onDelete, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lecture.id });

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
        "flex items-center justify-between py-2 px-3 border rounded bg-card hover:bg-muted/10 text-xs select-none",
        isDragging && "z-50 shadow border-primary"
      )}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-0.5 rounded hover:bg-muted text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-3 w-3" />
        </button>
        <span className="truncate text-foreground font-medium">{lecture.name}</span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onSelect}
          className="p-1 rounded hover:bg-muted text-primary transition flex items-center gap-1 text-[10px]"
          aria-label="View Lecture Questions"
        >
          <Eye className="h-3 w-3" />
        </button>
        <button
          onClick={onEdit}
          className="p-1 rounded hover:bg-muted text-muted-foreground transition"
          aria-label="Edit Lecture"
        >
          <Edit2 className="h-3 w-3" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded hover:bg-destructive/10 text-destructive transition"
          aria-label="Delete Lecture"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

const SortableSubjectItem: React.FC<SortableSubjectItemProps> = ({
  id,
  name,
  isFree,
  priceCents,
  lectures,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddLecture,
  onEditLecture,
  onDeleteLecture,
  onSelectLecture,
  onReorderLectures,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragLecturesEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = lectures.findIndex((l: any) => l.id === active.id);
    const newIndex = lectures.findIndex((l: any) => l.id === over.id);

    const reordered = arrayMove(lectures, oldIndex, newIndex);
    const payload = reordered.map((item: any, idx: number) => ({
      id: item.id,
      order_index: idx,
    }));

    onReorderLectures(payload);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg bg-card select-none">
      {/* Subject Row */}
      <div className="flex items-center justify-between p-3 border-b border-border/40 bg-muted/10">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1 rounded hover:bg-muted text-muted-foreground/60 cursor-grab active:cursor-grabbing shrink-0"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <button onClick={onToggleExpand} className="p-1 rounded hover:bg-muted shrink-0">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-foreground truncate block">{name}</span>
            <span className="text-[10px] text-muted-foreground">
              {isFree ? "Free" : formatCurrency(priceCents)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onAddLecture}
            className="p-1 rounded hover:bg-muted text-muted-foreground flex items-center gap-1 text-[10px]"
            aria-label="Add Lecture"
          >
            <Plus className="h-3 w-3" />
            <span>Add Lecture</span>
          </button>
          <button
            onClick={onEdit}
            className="p-1 rounded hover:bg-muted text-muted-foreground transition"
            aria-label="Edit Subject"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-destructive/10 text-destructive transition"
            aria-label="Delete Subject"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Lectures Accordion Body */}
      {isExpanded && (
        <div className="p-3 bg-muted/5 border-t border-border/20 space-y-2">
          {lectures.length === 0 ? (
            <p className="text-[10px] text-muted-foreground py-1 text-center">No lectures created.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragLecturesEnd}>
              <SortableContext items={lectures.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1.5">
                  {lectures.map((lecture) => (
                    <SortableLectureItem
                      key={lecture.id}
                      lecture={lecture}
                      onEdit={() => onEditLecture(lecture)}
                      onDelete={() => onDeleteLecture(lecture)}
                      onSelect={() => onSelectLecture(lecture.id, lecture.name)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
};

export const SubjectsPanel: React.FC<SubjectsPanelProps> = ({
  selectedModuleId,
  onSelectLecture,
}) => {
  const {
    subjects,
    isLoadingSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    reorderSubjects,
    createLecture,
    updateLecture,
    deleteLecture,
    reorderLectures,
  } = useSubjectsAndLectures(selectedModuleId);

  // Subject Expand States
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Subject Forms States
  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [subjectIsFree, setSubjectIsFree] = useState(true);
  const [subjectPriceDollars, setSubjectPriceDollars] = useState("0");
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);

  // Lecture Form States
  const [isLectureFormOpen, setIsLectureFormOpen] = useState(false);
  const [targetSubjectId, setTargetSubjectId] = useState<string | null>(null);
  const [editingLectureId, setEditingLectureId] = useState<string | null>(null);
  const [lectureName, setLectureName] = useState("");
  const [deleteLectureId, setDeleteLectureId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDragSubjectsEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = subjects.findIndex((s: any) => s.id === active.id);
    const newIndex = subjects.findIndex((s: any) => s.id === over.id);

    const reordered = arrayMove(subjects, oldIndex, newIndex);
    const payload = reordered.map((item: any, idx: number) => ({
      id: item.id,
      order_index: idx,
    }));

    await reorderSubjects(payload);
  };

  const handleOpenCreateSubject = () => {
    setEditingSubjectId(null);
    setSubjectName("");
    setSubjectIsFree(true);
    setSubjectPriceDollars("0");
    setIsSubjectFormOpen(true);
  };

  const handleOpenEditSubject = (subj: any) => {
    setEditingSubjectId(subj.id);
    setSubjectName(subj.name);
    setSubjectIsFree(subj.is_free);
    setSubjectPriceDollars(String(subj.price_cents / 100));
    setIsSubjectFormOpen(true);
  };

  const handleSaveSubject = async () => {
    if (!subjectName.trim()) return;
    const priceCents = Math.round(parseFloat(subjectPriceDollars || "0") * 100);

    const payload = {
      name: subjectName.trim(),
      is_free: subjectIsFree,
      price_cents: priceCents,
    };

    if (editingSubjectId) {
      await updateSubject({ id: editingSubjectId, ...payload });
    } else {
      await createSubject(payload);
    }
    setIsSubjectFormOpen(false);
  };

  const handleDeleteSubject = async () => {
    if (deleteSubjectId) {
      await deleteSubject(deleteSubjectId);
      setDeleteSubjectId(null);
    }
  };

  // --- Lecture Form Actions ---
  const handleOpenCreateLecture = (subjectId: string) => {
    setTargetSubjectId(subjectId);
    setEditingLectureId(null);
    setLectureName("");
    setIsLectureFormOpen(true);
  };

  const handleOpenEditLecture = (subjectId: string, lect: any) => {
    setTargetSubjectId(subjectId);
    setEditingLectureId(lect.id);
    setLectureName(lect.name);
    setIsLectureFormOpen(true);
  };

  const handleSaveLecture = async () => {
    if (!lectureName.trim()) return;

    if (editingLectureId) {
      await updateLecture({ id: editingLectureId, name: lectureName.trim() });
    } else if (targetSubjectId) {
      await createLecture({ subjectId: targetSubjectId, name: lectureName.trim() });
    }
    setIsLectureFormOpen(false);
  };

  const handleDeleteLecture = async () => {
    if (deleteLectureId) {
      await deleteLecture(deleteLectureId);
      setDeleteLectureId(null);
    }
  };

  if (!selectedModuleId) {
    return (
      <div className="flex flex-col border rounded-xl bg-card shadow-sm h-[600px] items-center justify-center p-6 text-center select-none text-muted-foreground text-xs">
        Select a module to display subjects and lectures.
      </div>
    );
  }

  return (
    <div className="flex flex-col border rounded-xl bg-card shadow-sm h-[600px] select-none">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">3. Subjects + Lectures</h3>
          <p className="text-[10px] text-muted-foreground">Detailed chapters and specific topics</p>
        </div>
        <button
          onClick={handleOpenCreateSubject}
          className="p-1.5 rounded-md bg-primary text-white hover:bg-primary/95 transition flex items-center gap-1 text-[10px] font-bold"
          aria-label="Add Subject"
        >
          <Plus className="h-3 w-3" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Accordion Form overlay inside Panel 3 - Subject Form */}
      {isSubjectFormOpen && (
        <div className="p-4 bg-muted/30 border-b space-y-3">
          <h4 className="text-xs font-bold text-foreground">
            {editingSubjectId ? "Edit Subject Properties" : "Create New Subject"}
          </h4>

          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-semibold">Subject Name</label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full rounded-md border bg-background px-2 py-1.5 text-xs text-foreground outline-none"
              placeholder="e.g. Valvular Disease"
              aria-label="Subject Name"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-[10px] text-muted-foreground font-semibold">Free Subject</label>
            <input
              type="checkbox"
              checked={subjectIsFree}
              onChange={(e) => setSubjectIsFree(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              aria-label="Is Subject Free"
            />
          </div>

          {!subjectIsFree && (
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-semibold">Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={subjectPriceDollars}
                onChange={(e) => setSubjectPriceDollars(e.target.value)}
                className="w-full rounded-md border bg-background px-2 py-1.5 text-xs text-foreground outline-none"
                placeholder="4.99"
                aria-label="Subject Price in USD"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSaveSubject}
              disabled={!subjectName.trim()}
              className="flex-1 px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-500 transition disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setIsSubjectFormOpen(false)}
              className="flex-1 px-3 py-1.5 bg-zinc-300 dark:bg-zinc-800 text-foreground rounded text-xs font-semibold hover:bg-muted transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Accordion Form overlay inside Panel 3 - Lecture Form */}
      {isLectureFormOpen && (
        <div className="p-4 bg-muted/30 border-b space-y-3">
          <h4 className="text-xs font-bold text-foreground">
            {editingLectureId ? "Edit Lecture Name" : "Create New Lecture"}
          </h4>

          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-semibold">Lecture Title</label>
            <input
              type="text"
              value={lectureName}
              onChange={(e) => setLectureName(e.target.value)}
              className="w-full rounded-md border bg-background px-2 py-1.5 text-xs text-foreground outline-none"
              placeholder="e.g. Mitral Stenosis"
              aria-label="Lecture Title"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveLecture}
              disabled={!lectureName.trim()}
              className="flex-1 px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-500 transition disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setIsLectureFormOpen(false)}
              className="flex-1 px-3 py-1.5 bg-zinc-300 dark:bg-zinc-800 text-foreground rounded text-xs font-semibold hover:bg-muted transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Subject listings */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-3">
        {isLoadingSubjects ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg border"></div>
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <p className="text-center py-8 text-[11px] text-muted-foreground">No subjects created yet.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragSubjectsEnd}>
            <SortableContext items={subjects.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {subjects.map((subj) => (
                  <SortableSubjectItem
                    key={subj.id}
                    id={subj.id}
                    name={subj.name}
                    isFree={subj.is_free}
                    priceCents={subj.price_cents}
                    lectures={subj.lectures}
                    isExpanded={!!expandedIds[subj.id]}
                    onToggleExpand={() => handleToggleExpand(subj.id)}
                    onEdit={() => handleOpenEditSubject(subj)}
                    onDelete={() => setDeleteSubjectId(subj.id)}
                    onAddLecture={() => handleOpenCreateLecture(subj.id)}
                    onEditLecture={(lect) => handleOpenEditLecture(subj.id, lect)}
                    onDeleteLecture={(lect) => setDeleteLectureId(lect.id)}
                    onSelectLecture={onSelectLecture}
                    onReorderLectures={reorderLectures}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteSubjectId}
        onClose={() => setDeleteSubjectId(null)}
        onConfirm={handleDeleteSubject}
        title="Delete Subject Chapter?"
        description="This will permanently delete this subject from this course track. You can only perform this action if it has no child lectures."
        confirmText="Delete Subject"
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={!!deleteLectureId}
        onClose={() => setDeleteLectureId(null)}
        onConfirm={handleDeleteLecture}
        title="Delete Lecture Topic?"
        description="This will permanently delete this lecture. You can only perform this action if it has no associated questions."
        confirmText="Delete Lecture"
        variant="destructive"
      />
    </div>
  );
};
export default SubjectsPanel;
