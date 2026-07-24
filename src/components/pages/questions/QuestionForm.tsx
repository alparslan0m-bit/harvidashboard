import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import {
  FileText,
  Image as ImageIcon,
  ListChecks,
  MessageSquareText,
  Save,
} from "lucide-react";
import { useQuestionMutations } from "@/hooks/useQuestions";
import {
  questionFormSchema,
  type QuestionFormValues,
} from "@/schemas/questionFormSchema";
import type { Question } from "@/types/database";
import { QuestionFormImageField } from "./QuestionFormImageField";
import { QuestionFormOptions } from "./QuestionFormOptions";
import { QuestionFormPreview } from "./QuestionFormPreview";

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
      const paddedOptions = [...question.options];
      while (paddedOptions.length < 4) {
        paddedOptions.push("");
      }
      reset({
        lecture_id: fixedLectureId,
        text: question.text,
        image_url: question.image_url || "",
        options: paddedOptions,
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

  const hasContent = !!(watchText || (Array.isArray(watchOptions) && watchOptions.some(Boolean)));

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in duration-300" />

        <Dialog.Content className="fixed inset-0 z-50 flex flex-col bg-background focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-300">
          {/* ── Header ── */}
          <div className="relative border-b border-border/60 bg-card">
            <div className="absolute inset-0 z-0 bg-vercel-mesh opacity-50 dark:opacity-30 pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
            <div className="relative z-10 flex items-center justify-between px-6 py-3.5">
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
                    Fill in question details. Ensure one option is marked as correct.
                  </Dialog.Description>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="question-form"
                  disabled={isSubmitting}
                  className="relative inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:brightness-105 disabled:opacity-50 overflow-hidden after:absolute after:inset-0 after:animate-shimmer after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)]"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-3 w-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Save Question
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full grid grid-cols-1 lg:grid-cols-5">
              {/* ── Left: Form Editor ── */}
              <div className="lg:col-span-3 overflow-y-auto border-r border-border/40 p-6">
                <form
                  id="question-form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="max-w-3xl mx-auto space-y-5 select-none"
                >
                  {/* Section 1 — Question Text */}
                  <section className="space-y-1.5">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/40">
                      <div className="h-6 w-6 rounded-md flex items-center justify-center bg-gradient-to-br from-primary/20 to-chart-5/20 text-primary">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <h3 className="text-sm font-semibold tracking-tight text-foreground font-heading">Question Content</h3>
                    </div>
                    <textarea
                      {...register("text")}
                      rows={3}
                      className="w-full rounded-xl border border-input bg-card px-3.5 py-2 min-h-[80px] text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow duration-200 resize-y"
                      placeholder="e.g. What is the pathognomonic murmur heard in Mitral Stenosis?"
                    />
                    {errors.text && (
                      <p className="text-xs text-red-500">
                        {errors.text.message}
                      </p>
                    )}
                  </section>

                  {/* Section 2 — Image */}
                  <section className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground/80 flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-primary" />
                      Image
                      <span className="text-[10px] font-normal text-muted-foreground/75 normal-case">
                        (Optional)
                      </span>
                    </span>
                    <QuestionFormImageField
                      register={register}
                      errors={errors}
                      watchImageUrl={watchImageUrl}
                      hidePreview={true}
                      hideLabel={true}
                    />
                  </section>

                  {/* Section 3 — Answer Options */}
                  <section className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground/80 flex items-center gap-1.5">
                      <ListChecks className="h-3.5 w-3.5 text-primary" />
                      Answer Options
                    </span>
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
                  <section className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground/80 flex items-center gap-1.5">
                      <MessageSquareText className="h-3.5 w-3.5 text-primary" />
                      Explanation
                      <span className="text-[10px] font-normal text-muted-foreground/75 normal-case">
                        (Optional)
                      </span>
                    </label>
                    <textarea
                      {...register("explanation")}
                      rows={2}
                      className="w-full rounded-xl border border-input bg-card px-3.5 py-2 min-h-[60px] text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow duration-200 resize-y"
                      placeholder="Provide context explaining why the selected answer is correct."
                    />
                  </section>
                </form>
              </div>

              {/* ── Right: Live Preview ── */}
              <QuestionFormPreview
                text={watchText}
                imageUrl={watchImageUrl}
                options={watchOptions}
                correctAnswerIndex={currentCorrectIndex}
                explanation={watchExplanation}
                hasContent={hasContent}
              />
            </div>
          </div>


        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default QuestionForm;
