import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  FileText,
  Image as ImageIcon,
  ListChecks,
  MessageSquareText,
  Check,
  Eye,
} from "lucide-react";
import { useQuestionMutations } from "@/hooks/useQuestions";
import {
  questionFormSchema,
  type QuestionFormValues,
} from "@/schemas/questionFormSchema";
import type { Question } from "@/types/database";
import { QuestionFormImageField } from "./QuestionFormImageField";
import { QuestionFormOptions } from "./QuestionFormOptions";

interface QuestionFormProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  /** The lecture this question belongs to. */
  fixedLectureId?: string | null;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  isOpen,
  onClose,
  fixedLectureId,
}) => {
  const { createQuestion, updateQuestion } = useQuestionMutations();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      lecture_id: "",
      text: "",
      image_url: "",
      options: ["", "", "", ""],
      correct_answer_index: 0,
      explanation: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  } as any);

  const currentCorrectIndex = watch("correct_answer_index");
  const watchImageUrl = watch("image_url");
  const watchText = watch("text");
  const watchOptions = watch("options");
  const watchExplanation = watch("explanation");

  useEffect(() => {
    if (!isOpen || !fixedLectureId) return;

    if (question) {
      reset({
        lecture_id: fixedLectureId,
        text: question.text,
        image_url: question.image_url || "",
        options: question.options,
        correct_answer_index: question.correct_answer_index,
        explanation: question.explanation || "",
      });
    } else {
      reset({
        lecture_id: fixedLectureId,
        text: "",
        image_url: "",
        options: ["", "", "", ""],
        correct_answer_index: 0,
        explanation: "",
      });
    }
  }, [question, isOpen, fixedLectureId, reset]);

  const onSubmit = async (values: QuestionFormValues) => {
    try {
      const payload = {
        lecture_id: fixedLectureId!,
        text: values.text,
        image_url: values.image_url || null,
        options: values.options,
        correct_answer_index: values.correct_answer_index,
        explanation: values.explanation || null,
        question_order: question?.question_order || 0,
      };

      if (question) {
        await updateQuestion({ id: question.id, ...payload });
      } else {
        await createQuestion(payload);
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save question");
    }
  };

  const previewOptions = Array.isArray(watchOptions) ? watchOptions : [];
  const hasContent = watchText || previewOptions.some((o) => o);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in duration-300" />

        <Dialog.Content className="fixed inset-0 z-50 flex flex-col bg-background focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-300">
          {/* ── Header ── */}
          <div className="relative border-b border-border/60 bg-card">
            <div className="absolute inset-0 bg-vercel-mesh opacity-[0.03] pointer-events-none" />
            <div className="relative flex items-center justify-between px-6 lg:px-10 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <Dialog.Title className="text-base font-semibold text-foreground tracking-tight font-heading">
                    {question
                      ? "Edit Multiple Choice Question"
                      : "Create New Quiz Question"}
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-muted-foreground mt-0.5">
                    Fill in question details. Ensure one option is marked as
                    correct.
                  </Dialog.Description>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Close</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full grid grid-cols-1 lg:grid-cols-5">
              {/* ── Left: Form ── */}
              <div className="lg:col-span-3 overflow-y-auto border-r border-border/40">
                <form
                  id="question-form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="max-w-2xl mx-auto px-6 lg:px-10 py-8 space-y-8 select-none"
                >
                  {/* Section 1 — Question Text */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                        1
                      </span>
                      <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        Question Text
                      </label>
                    </div>
                    <textarea
                      {...register("text")}
                      rows={4}
                      className="w-full rounded-xl border border-input bg-card px-4 py-3 min-h-[110px] text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow duration-200 resize-y"
                      placeholder="e.g. What is the pathognomonic murmur heard in Mitral Stenosis?"
                    />
                    {errors.text && (
                      <p className="text-xs text-red-500">
                        {errors.text.message}
                      </p>
                    )}
                  </section>

                  {/* Section 2 — Image */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                        2
                      </span>
                      <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        Image
                        <span className="text-xs font-normal text-muted-foreground">
                          (Optional)
                        </span>
                      </span>
                    </div>
                    <QuestionFormImageField
                      register={register}
                      errors={errors}
                      watchImageUrl={watchImageUrl}
                    />
                  </section>

                  {/* Section 3 — Answer Options */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                        3
                      </span>
                      <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
                        Answer Options
                      </span>
                    </div>
                    <QuestionFormOptions
                      fields={fields}
                      currentCorrectIndex={currentCorrectIndex}
                      register={register}
                      setValue={setValue}
                      append={append}
                      remove={remove}
                      errors={errors}
                    />
                  </section>

                  {/* Section 4 — Explanation */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                        4
                      </span>
                      <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <MessageSquareText className="h-3.5 w-3.5 text-muted-foreground" />
                        Explanation
                        <span className="text-xs font-normal text-muted-foreground">
                          (Optional)
                        </span>
                      </label>
                    </div>
                    <textarea
                      {...register("explanation")}
                      rows={3}
                      className="w-full rounded-xl border border-input bg-card px-4 py-3 min-h-[88px] text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow duration-200 resize-y"
                      placeholder="Provide context explaining why the selected answer is correct."
                    />
                  </section>
                </form>
              </div>

              {/* ── Right: Live Preview ── */}
              <div className="hidden lg:flex lg:col-span-2 flex-col bg-muted/20 overflow-y-auto">
                <div className="px-6 lg:px-8 py-8 flex-1">
                  <div className="flex items-center gap-2 mb-6">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Live Preview
                    </h3>
                  </div>

                  {hasContent ? (
                    <div className="space-y-5">
                      {/* Preview: Question card */}
                      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                        <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap">
                          {watchText || (
                            <span className="text-muted-foreground italic">
                              Question text will appear here...
                            </span>
                          )}
                        </p>

                        {watchImageUrl &&
                          watchImageUrl.startsWith("http") && (
                            <div className="mt-3 rounded-xl border border-border/40 bg-muted/20 p-2">
                              <img
                                src={watchImageUrl}
                                alt="Question diagram"
                                className="max-h-36 mx-auto rounded-lg object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display =
                                    "none";
                                }}
                              />
                            </div>
                          )}
                      </div>

                      {/* Preview: Options */}
                      <div className="space-y-2">
                        {previewOptions.map((opt, idx) => {
                          if (!opt && idx >= 2) return null;
                          const isCorrect = idx === currentCorrectIndex;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm transition-all duration-200 ${
                                isCorrect
                                  ? "border-emerald-300/60 bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-400"
                                  : "border-border/50 bg-card text-muted-foreground"
                              }`}
                            >
                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shrink-0 ${
                                  isCorrect
                                    ? "bg-emerald-600 text-white"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {isCorrect ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  String.fromCharCode(65 + idx)
                                )}
                              </span>
                              <span className="truncate">
                                {opt || (
                                  <span className="italic text-muted-foreground/50">
                                    Option {String.fromCharCode(65 + idx)}
                                  </span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Preview: Explanation */}
                      {watchExplanation && (
                        <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-4 py-3">
                          <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                            Explanation
                          </span>
                          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {watchExplanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-3">
                        <Eye className="h-5 w-5 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Start typing to see a live preview
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Your question will appear here as you fill in the form
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="border-t border-border/60 bg-card px-6 lg:px-10 py-3.5">
            <div className="max-w-2xl flex items-center gap-3">
              <button
                type="submit"
                form="question-form"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:brightness-105 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Question"
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default QuestionForm;
