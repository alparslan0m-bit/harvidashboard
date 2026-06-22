import React, { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  HelpCircle,
  ExternalLink,
  Image as ImageIcon,
  Check,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { STALE_TIMES } from "@/lib/constants";
import { useLectureQuestions } from "@/hooks/useCurriculum";
import { useQuestionMutations } from "@/hooks/useQuestions";
import { QuestionForm } from "@/components/pages/questions/QuestionForm";
import { PageHeader, ConfirmDialog, ErrorView } from "@/components/shared";
import type { Question } from "@/types/database";

export const CurriculumLectureQuestions: React.FC = () => {
  const navigate = useNavigate();
  const { lectureId } = useParams<{ lectureId: string }>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

  const { questions, isLoadingQuestions, refetch } = useLectureQuestions(
    lectureId || null,
  );
  const { deleteQuestion } = useQuestionMutations();

  const {
    data: lecture,
    isLoading: isLoadingLecture,
    error: lectureError,
  } = useQuery({
    queryKey: ["curriculum", "lecture", lectureId],
    queryFn: async () => {
      if (!lectureId) return null;
      const { data, error } = await supabaseAdmin
        .from("lectures")
        .select("name")
        .eq("id", lectureId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!lectureId,
    staleTime: STALE_TIMES.curriculum,
  });

  const lectureName = lecture?.name ?? "Lecture";
  const isLoading = isLoadingLecture || isLoadingQuestions;

  const summary = useMemo(() => {
    if (!questions) return { hasImages: 0, hasExplanations: 0 };
    return {
      hasImages: questions.filter((q) => q.image_url).length,
      hasExplanations: questions.filter((q) => q.explanation).length,
    };
  }, [questions]);

  const openCreate = () => {
    setSelectedQuestion(null);
    setIsFormOpen(true);
  };

  const openEdit = (q: Question) => {
    setSelectedQuestion(q);
    setIsFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteQuestionId) return;
    await deleteQuestion(deleteQuestionId);
    setDeleteQuestionId(null);
    refetch();
  };

  if (lectureError) {
    return (
      <ErrorView
        title="Failed to load lecture"
        message={lectureError.message}
        onRetry={() => refetch()}
        className="mt-12"
      />
    );
  }

  if (!lectureId) {
    return (
      <ErrorView
        title="Lecture not found"
        message="No lecture was selected."
        onRetry={() => navigate("/curriculum")}
        className="mt-12"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Lecture Questions — ${lectureName}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/curriculum")}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent transition"
            >
              Back to Curriculum
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/95 transition"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </button>
            <Link
              to={`/questions?lectureId=${encodeURIComponent(lectureId)}`}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent transition"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Question Bank
            </Link>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-4 animate-pulse select-none">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-28 bg-muted border rounded-lg" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground select-none rounded-3xl border border-border/60 bg-muted/40">
          <HelpCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/70" />
          <p className="text-sm font-semibold text-foreground">
            No questions found for this lecture.
          </p>
          <p className="text-xs text-muted-foreground">
            Create the first question to get started.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition"
          >
            <Plus className="h-4 w-4" />
            Add First Question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-[11px] font-semibold text-muted-foreground bg-muted/40 px-4 py-3 rounded-xl border border-border/60">
            <span>
              Total: {questions.length} question
              {questions.length === 1 ? "" : "s"}
            </span>
            <span className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              {summary.hasImages} with image{summary.hasImages === 1 ? "" : "s"}
            </span>
            <span className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-500" />
              {summary.hasExplanations} with explanation
              {summary.hasExplanations === 1 ? "" : "s"}
            </span>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="border border-border/60 p-4 rounded-3xl bg-card shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary text-sm font-bold">
                      Q{idx + 1}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {q.text}
                      </p>
                      {q.image_url && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                          <ImageIcon className="h-3.5 w-3.5" />
                          Has Image
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(q)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition"
                      title="Open question page"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteQuestionId(q.id)}
                      className="rounded-lg p-2 text-destructive hover:bg-destructive/10 transition"
                      title="Delete question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-2 mt-4">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = oIdx === q.correct_answer_index;
                    return (
                      <div
                        key={oIdx}
                        className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition ${
                          isCorrect
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-border/60 bg-muted/10 text-muted-foreground"
                        }`}
                      >
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-muted text-xs font-semibold uppercase">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        {isCorrect && (
                          <Check className="h-4 w-4 text-emerald-600" />
                        )}
                        <span className="truncate">{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-4 rounded-2xl border border-dashed border-border/70 bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-2">
                      Explanation
                    </span>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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

      <ConfirmDialog
        isOpen={!!deleteQuestionId}
        onClose={() => setDeleteQuestionId(null)}
        onConfirm={confirmDelete}
        title="Delete quiz question?"
        description="This will permanently delete this question from the lecture topic."
        confirmText="Delete Question"
        variant="destructive"
      />
    </div>
  );
};

export default CurriculumLectureQuestions;
