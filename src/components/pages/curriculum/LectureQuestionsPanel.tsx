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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-white hover:bg-primary/90 text-xs font-semibold select-none transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Question</span>
            </button>
            <Link
              to={`/questions?lectureId=${lectureId}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border text-foreground hover:bg-accent text-xs font-semibold select-none transition"
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
          <div className="text-center py-12 text-muted-foreground select-none">
            <HelpCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-xs font-medium">No questions found in this lecture topic.</p>
            <button
              onClick={handleCreate}
              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded bg-primary text-white text-xs font-semibold hover:bg-primary/95 transition cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>Add First Question</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 select-none">
            {/* Summary Bar */}
            <div className="flex gap-2 items-center justify-between text-[11px] font-semibold text-muted-foreground bg-muted/40 px-3 py-2 rounded-lg border border-border/60">
              <span>Total: {questions.length} questions</span>
              <span className="flex items-center gap-1">
                <ImageIcon className="h-3.5 w-3.5 text-indigo-500" />
                {summary.hasImages} with image{summary.hasImages === 1 ? "" : "s"}
              </span>
              <span className="flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-emerald-500" />
                {summary.hasExplanations} with explanation{summary.hasExplanations === 1 ? "" : "s"}
              </span>
            </div>

            {/* Question List */}
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="border border-border/60 p-4 rounded-lg bg-card space-y-3 shadow-sm hover:shadow transition duration-200 group">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                        Q{idx + 1}
                      </div>
                      {q.image_url && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-200/20">
                          <ImageIcon className="h-3 w-3" />
                          <span>Has Image</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(q)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground transition opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Edit question"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-1 rounded hover:bg-destructive/15 text-destructive transition opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete question"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      <CopyButton text={q.text} className="h-7 w-7 text-muted-foreground hover:text-foreground" />
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-foreground leading-relaxed">
                    {q.text}
                  </p>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-1.5">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = oIdx === q.correct_answer_index;
                      return (
                        <div
                          key={oIdx}
                          className={`text-[11px] px-2.5 py-2 rounded border transition-colors flex items-center gap-1.5 ${
                            isCorrect
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold"
                              : "bg-muted/10 border-border/60 text-muted-foreground"
                          }`}
                        >
                          <span className="uppercase font-bold shrink-0">{String.fromCharCode(65 + oIdx)}.</span>
                          {isCorrect && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                          <span className="truncate">{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="bg-muted/30 p-2.5 rounded border border-dashed border-border text-[10px] text-muted-foreground mt-2 leading-relaxed">
                      <span className="font-bold text-foreground block mb-0.5 uppercase tracking-wide">Explanation</span>
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
