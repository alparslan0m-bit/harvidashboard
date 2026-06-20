import React, { useMemo, useState } from "react";
import { useLectureQuestions } from "../../../hooks/useCurriculum";
import { useQuestionMutations } from "../../../hooks/useQuestions";
import { SlideOver } from "../../shared/SlideOver";
import { HelpCircle, ExternalLink, Image as ImageIcon, Check, Plus, Edit2, Trash2 } from "lucide-react";
import { Link } from "react-router";
import CopyButton from "../../shared/CopyButton";
import QuestionForm from "../../pages/questions/QuestionForm";
import ConfirmDialog from "../../shared/ConfirmDialog";
import type { Question } from "../../../types/database";

interface LectureQuestionsPanelProps {
  lectureId: string | null;
  lectureName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const LectureQuestionsPanel: React.FC<LectureQuestionsPanelProps> = ({
  lectureId,
  lectureName,
  isOpen,
  onClose,
}) => {
  const { questions, isLoadingQuestions, refetch } = useLectureQuestions(lectureId);
  const { deleteQuestion } = useQuestionMutations();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

  // Compute metrics for the summary bar
  const summary = useMemo(() => {
    if (!questions) return { hasImages: 0, hasExplanations: 0 };
    const hasImages = questions.filter((q) => q.image_url).length;
    const hasExplanations = questions.filter((q) => q.explanation).length;
    return { hasImages, hasExplanations };
  }, [questions]);

  const handleCreate = () => {
    setSelectedQuestion(null);
    setIsFormOpen(true);
  };

  const handleEdit = (q: Question) => {
    setSelectedQuestion(q);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteQuestionId(id);
  };

  const confirmDelete = async () => {
    if (deleteQuestionId) {
      await deleteQuestion(deleteQuestionId);
      setDeleteQuestionId(null);
      refetch();
    }
  };

  return (
    <>
      <SlideOver
        isOpen={isOpen}
        onClose={onClose}
        title={`Lecture Questions — ${lectureName} ${questions.length > 0 ? `(${questions.length})` : ""}`}
        description="List of questions in this topic. Add, edit, or delete questions directly."
        footer={
          <div className="flex items-center gap-2 justify-between w-full">
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white hover:brightness-105 text-xs font-bold select-none shadow-sm transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Question</span>
            </button>
            <Link
              to={`/questions?lectureId=${lectureId}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-foreground hover:bg-accent text-xs font-bold select-none transition-all"
            >
              <span>Open in Question Bank</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        }
      >
        {isLoadingQuestions ? (
          <div className="space-y-4 animate-pulse select-none">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted border rounded-lg"></div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-16 select-none rounded-xl bg-muted/20 border border-dashed border-border/50">
            <HelpCircle className="h-9 w-9 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No questions found in this lecture topic.</p>
            <button
              onClick={handleCreate}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:brightness-105 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add First Question</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 select-none">
            {/* Summary Strip */}
            <div className="flex items-stretch divide-x divide-border/40 rounded-xl bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 border border-border/50 shadow-xs overflow-hidden">
              <div className="flex-1 flex flex-col items-center py-2.5 gap-0.5">
                <span className="text-sm font-bold text-foreground">{questions.length}</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Questions</span>
              </div>
              <div className="flex-1 flex flex-col items-center py-2.5 gap-0.5">
                <span className="text-sm font-bold text-primary">{summary.hasImages}</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" /> Images
                </span>
              </div>
              <div className="flex-1 flex flex-col items-center py-2.5 gap-0.5">
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{summary.hasExplanations}</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" /> Explained
                </span>
              </div>
            </div>

            {/* Question List */}
            <div className="space-y-4">
              {questions.map((q, idx) => (
              <div key={q.id} className="border border-border/50 p-4 rounded-xl bg-card space-y-3 shadow-xs hover:shadow-sm transition-shadow duration-200 group">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs font-bold">
                        Q{idx + 1}
                      </div>
                      {q.image_url && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/8 px-2 py-0.5 rounded-full ring-1 ring-inset ring-primary/15 font-medium">
                          <ImageIcon className="h-3 w-3" />
                          <span>Image</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(q)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-all duration-150 opacity-50 group-hover:opacity-100 cursor-pointer"
                        title="Edit question"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/15 text-destructive transition-all duration-150 opacity-50 group-hover:opacity-100 cursor-pointer"
                        title="Delete question"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <CopyButton text={q.text} className="h-7 w-7 text-muted-foreground hover:text-foreground" />
                    </div>
                  </div>

                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    {q.text}
                  </p>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = oIdx === q.correct_answer_index;
                      return (
                        <div
                          key={oIdx}
                          className={`text-xs px-3 py-2.5 rounded-lg border transition-colors flex items-center gap-2 ${
                            isCorrect
                              ? "bg-emerald-50/80 border-emerald-300/40 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800/30 dark:text-emerald-400 font-semibold"
                              : "bg-muted/10 border-border/50 text-muted-foreground"
                          }`}
                        >
                          <span className="font-bold bg-muted rounded-md px-1.5 py-0.5 text-[11px] uppercase text-muted-foreground shrink-0">{String.fromCharCode(65 + oIdx)}</span>
                          {isCorrect && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                          <span className="truncate">{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="bg-muted/20 p-3 rounded-xl border-l-2 border-l-primary/30 border border-border/30 text-xs text-muted-foreground mt-2 leading-relaxed">
                      <span className="font-bold text-foreground block mb-1 text-[11px] uppercase tracking-wide">Explanation</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </SlideOver>

      {/* Add / Edit Question Form */}
      {isFormOpen && (
        <QuestionForm
          question={selectedQuestion}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedQuestion(null);
            refetch();
          }}
          initialLectureId={lectureId}
        />
      )}

      {/* Delete Question Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteQuestionId}
        onClose={() => setDeleteQuestionId(null)}
        onConfirm={confirmDelete}
        title="Delete quiz question?"
        description="This will permanently delete this question from the lecture topic."
        confirmText="Delete Question"
        variant="destructive"
      />
    </>
  );
};

export default LectureQuestionsPanel;
