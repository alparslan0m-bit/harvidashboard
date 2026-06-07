import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useQuestionMutations } from "../../../hooks/useQuestions";
import { SlideOver } from "../../shared/SlideOver";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { Plus, Trash, Check, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { Question } from "../../../types/database";

const questionFormSchema = zod.object({
  lecture_id: zod.string().min(1, "Lecture is required"),
  text: zod.string().min(1, "Question text is required").max(1000, "Must be under 1000 chars"),
  image_url: zod.string().url("Must be a valid URL").or(zod.literal("")).optional(),
  options: zod.array(zod.string().min(1, "Option text cannot be empty"))
    .min(2, "Minimum 2 options required")
    .max(6, "Maximum 6 options allowed"),
  correct_answer_index: zod.number().min(0).max(5),
  explanation: zod.string().optional(),
});

type QuestionFormValues = zod.infer<typeof questionFormSchema>;

interface QuestionFormProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  initialLectureId?: string | null;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  isOpen,
  onClose,
  initialLectureId,
}) => {
  const { createQuestion, updateQuestion } = useQuestionMutations();
  
  const [years, setYears] = useState<{ id: string; name: string }[]>([]);
  const [modules, setModules] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [lectures, setLectures] = useState<{ id: string; name: string }[]>([]);

  // Selected hierarchy states (to hydrate the form selects)
  const [selYear, setSelYear] = useState("");
  const [selModule, setSelModule] = useState("");
  const [selSubject, setSelSubject] = useState("");

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

  // Hydrate lists initially
  useEffect(() => {
    supabaseAdmin
      .from("years")
      .select("id, name")
      .order("name", { ascending: true })
      .then(({ data }) => setYears(data || []));
  }, []);

  // Hydrate full cascading chain for edits or initial values
  useEffect(() => {
    const hydrateChain = async () => {
      let activeLectureId = question?.lecture_id || initialLectureId;
      if (!activeLectureId) return;

      try {
        const { data: lect } = await supabaseAdmin
          .from("lectures")
          .select("*, subjects(*, modules(*))")
          .eq("id", activeLectureId)
          .single();

        if (lect) {
          const subject = (lect as any).subjects;
          const module = subject?.modules;
          const yearId = module?.year_id;

          setSelYear(yearId || "");
          setSelModule(module?.id || "");
          setSelSubject(subject?.id || "");

          // Load other selections
          if (yearId) {
            const { data: mods } = await supabaseAdmin.from("modules").select("id, name").eq("year_id", yearId);
            setModules(mods || []);
          }
          if (module?.id) {
            const { data: subjs } = await supabaseAdmin.from("subjects").select("id, name").eq("module_id", module.id);
            setSubjects(subjs || []);
          }
          if (subject?.id) {
            const { data: lects } = await supabaseAdmin.from("lectures").select("id, name").eq("subject_id", subject.id);
            setLectures(lects || []);
          }

          setValue("lecture_id", activeLectureId);
        }
      } catch {
        // Fallback silently
      }
    };

    if (isOpen) {
      if (question) {
        reset({
          lecture_id: question.lecture_id,
          text: question.text,
          image_url: question.image_url || "",
          options: question.options,
          correct_answer_index: question.correct_answer_index,
          explanation: question.explanation || "",
        });
        hydrateChain();
      } else {
        reset({
          lecture_id: initialLectureId || "",
          text: "",
          image_url: "",
          options: ["", "", "", ""],
          correct_answer_index: 0,
          explanation: "",
        });
        if (initialLectureId) {
          hydrateChain();
        } else {
          setSelYear("");
          setSelModule("");
          setSelSubject("");
          setModules([]);
          setSubjects([]);
          setLectures([]);
        }
      }
    }
  }, [question, isOpen, initialLectureId, reset, setValue]);

  // Handle Cascades on changes inside form
  const handleYearChange = async (yearId: string) => {
    setSelYear(yearId);
    setSelModule("");
    setSelSubject("");
    setValue("lecture_id", "");
    setSubjects([]);
    setLectures([]);

    if (yearId) {
      const { data } = await supabaseAdmin.from("modules").select("id, name").eq("year_id", yearId);
      setModules(data || []);
    } else {
      setModules([]);
    }
  };

  const handleModuleChange = async (moduleId: string) => {
    setSelModule(moduleId);
    setSelSubject("");
    setValue("lecture_id", "");
    setLectures([]);

    if (moduleId) {
      const { data } = await supabaseAdmin.from("subjects").select("id, name").eq("module_id", moduleId);
      setSubjects(data || []);
    } else {
      setSubjects([]);
    }
  };

  const handleSubjectChange = async (subjectId: string) => {
    setSelSubject(subjectId);
    setValue("lecture_id", "");

    if (subjectId) {
      const { data } = await supabaseAdmin.from("lectures").select("id, name").eq("subject_id", subjectId);
      setLectures(data || []);
    } else {
      setLectures([]);
    }
  };

  const onSubmit = async (values: QuestionFormValues) => {
    try {
      const payload = {
        lecture_id: values.lecture_id,
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

  const isFormValid = watchImageUrl && watchImageUrl.startsWith("http");

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={question ? "Edit Multiple Choice Question" : "Create New Quiz Question"}
      description="Fill in question details. Ensure one option is marked as correct."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 select-none pb-8">
        {/* Cascade Select Group */}
        <div className="space-y-3 bg-muted/20 p-3 rounded-lg border">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Select Lecture Topic</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-semibold">Year</label>
              <select
                value={selYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full rounded border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none"
              >
                <option value="">Select Year</option>
                {years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-semibold">Module</label>
              <select
                value={selModule}
                onChange={(e) => handleModuleChange(e.target.value)}
                disabled={!selYear}
                className="w-full rounded border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none disabled:opacity-50"
              >
                <option value="">Select Module</option>
                {modules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-semibold">Subject</label>
              <select
                value={selSubject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                disabled={!selModule}
                className="w-full rounded border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none disabled:opacity-50"
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-semibold">Lecture</label>
              <select
                {...register("lecture_id")}
                disabled={!selSubject}
                className="w-full rounded border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none disabled:opacity-50"
              >
                <option value="">Select Lecture</option>
                {lectures.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              {errors.lecture_id && <p className="text-[10px] text-red-500">{errors.lecture_id.message}</p>}
            </div>
          </div>
        </div>

        {/* Question Text */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Question Text</label>
          <textarea
            {...register("text")}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. What is the pathognomonic murmur heard in Mitral Stenosis?"
          />
          {errors.text && <p className="text-[10px] text-red-500">{errors.text.message}</p>}
        </div>

        {/* Image URL with live preview */}
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Image URL (Optional)</span>
            </label>
            <input
              type="text"
              {...register("image_url")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
              placeholder="https://example.com/murmur.png"
            />
            {errors.image_url && <p className="text-[10px] text-red-500">{errors.image_url.message}</p>}
          </div>

          {isFormValid && (
            <div className="rounded-lg border border-dashed border-border bg-muted/10 p-2 text-center">
              <p className="text-[10px] text-muted-foreground mb-2">Live Image Preview</p>
              <img
                src={watchImageUrl}
                alt="Question diagram"
                className="max-h-36 mx-auto rounded object-contain border bg-background"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        {/* Dynamic Options List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">Options list</label>
            {fields.length < 6 && (
              <button
                type="button"
                onClick={() => append("")}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-500"
              >
                <Plus className="h-3 w-3" />
                <span>Add Option</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {fields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-center">
                {/* Radio correctness switch */}
                <button
                  type="button"
                  onClick={() => setValue("correct_answer_index", idx)}
                  className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 transition ${
                    currentCorrectIndex === idx
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-background border-input text-transparent hover:border-emerald-600"
                  }`}
                  aria-label={`Mark option ${String.fromCharCode(65 + idx)} as correct`}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>

                <span className="text-xs font-bold text-muted-foreground uppercase w-4 text-center shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>

                <input
                  type="text"
                  {...register(`options.${idx}` as any)}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                />

                {fields.length > 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      remove(idx);
                      // Reset correct index if out of bounds
                      if (currentCorrectIndex >= fields.length - 1) {
                        setValue("correct_answer_index", 0);
                      }
                    }}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded transition"
                    aria-label="Remove option"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.options && <p className="text-[10px] text-red-500">{errors.options.message}</p>}
        </div>

        {/* Explanation */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Explanation (Optional)</label>
          <textarea
            {...register("explanation")}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:ring-1 focus:ring-primary"
            placeholder="Provide context explaining why the selected answer is correct."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center rounded-md bg-primary py-2 text-xs font-semibold text-white hover:bg-primary/95 transition disabled:opacity-50"
          >
            {isSubmitting ? "Saving question..." : "Save Question"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center rounded-md border bg-background py-2 text-xs font-semibold text-foreground hover:bg-accent transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </SlideOver>
  );
};
export default QuestionForm;
