import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQuestionMutations } from "@/hooks/useQuestions";
import {
  questionFormSchema,
  type QuestionFormValues,
} from "@/schemas/questionFormSchema";
import { SlideOver } from "@/components/shared/SlideOver";
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

  const form = (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 select-none pb-8"
    >
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">
          Question Text
        </label>
        <textarea
          {...register("text")}
          rows={3}
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 min-h-[88px] text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow duration-200"
          placeholder="e.g. What is the pathognomonic murmur heard in Mitral Stenosis?"
        />
        {errors.text && (
          <p className="text-xs text-red-500">{errors.text.message}</p>
        )}
      </div>

      <QuestionFormImageField
        register={register}
        errors={errors}
        watchImageUrl={watchImageUrl}
      />

      <QuestionFormOptions
        fields={fields}
        currentCorrectIndex={currentCorrectIndex}
        register={register}
        setValue={setValue}
        append={append}
        remove={remove}
        errors={errors}
      />

      <hr className="border-border/40" />

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">
          Explanation (Optional)
        </label>
        <textarea
          {...register("explanation")}
          rows={3}
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 min-h-[88px] text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow duration-200"
          placeholder="Provide context explaining why the selected answer is correct."
        />
      </div>

      <div className="flex gap-4 pt-5 border-t border-border/40">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 inline-flex items-center justify-center rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:brightness-105 disabled:opacity-50"
        >
          {isSubmitting ? "Saving question..." : "Save Question"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 inline-flex items-center justify-center rounded-xl border border-input bg-background py-2.5 text-sm font-bold text-foreground hover:bg-muted transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={
        question ? "Edit Multiple Choice Question" : "Create New Quiz Question"
      }
      description="Fill in question details. Ensure one option is marked as correct."
    >
      {form}
    </SlideOver>
  );
};

export default QuestionForm;


