import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { Plus, Trash, Check } from "lucide-react";
import type { QuestionFormValues } from "@/schemas/questionFormSchema";

interface QuestionFormOptionsProps {
  fields: { id: string }[];
  currentCorrectIndex: number;
  register: UseFormRegister<QuestionFormValues>;
  setValue: UseFormSetValue<QuestionFormValues>;
  append: (value: string) => void;
  remove: (index: number) => void;
  errors: FieldErrors<QuestionFormValues>;
}

export function QuestionFormOptions({
  fields,
  currentCorrectIndex,
  register,
  setValue,
  append,
  remove,
  errors,
}: QuestionFormOptionsProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {fields.map((field, idx) => {
          const isCorrect = currentCorrectIndex === idx;
          return (
            <div
              key={field.id}
              className={`rounded-full border px-3 py-2 transition-all duration-200 ${
                isCorrect
                  ? "border-emerald-200 bg-emerald-50/50 shadow-xs dark:border-emerald-800/30 dark:bg-emerald-950/20"
                  : "border-border/60 bg-card hover:border-border/80 shadow-xs"
              }`}
            >
              <div className="flex gap-3 items-center">
                <button
                  type="button"
                  onClick={() => setValue("correct_answer_index", idx)}
                  className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isCorrect
                      ? "bg-emerald-500 border-emerald-500 text-white scale-100 shadow-sm"
                      : "bg-background border-border/80 text-transparent hover:border-emerald-400 scale-[0.95]"
                  }`}
                  aria-label={`Mark option ${String.fromCharCode(65 + idx)} as correct`}
                >
                  <Check className="h-4 w-4" />
                </button>

                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/80 text-xs font-bold uppercase text-muted-foreground/80">
                  {String.fromCharCode(65 + idx)}
                </span>

                <input
                  type="text"
                  {...register(`options.${idx}` as any)}
                  className="flex-1 bg-transparent px-1 py-1.5 text-sm text-foreground outline-none placeholder-muted-foreground/50 transition-shadow duration-200"
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                />

                {fields.length > 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      remove(idx);
                      if (currentCorrectIndex >= fields.length - 1) {
                        setValue("correct_answer_index", 0);
                      }
                    }}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors duration-150"
                    aria-label="Remove option"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {fields.length < 6 && (
        <button
          type="button"
          onClick={() => append("")}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-full border border-dashed border-border/60 bg-transparent py-3 text-xs font-semibold text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          <span>Add Option</span>
        </button>
      )}

      {errors.options && (
        <p className="text-xs text-red-500">{errors.options.message}</p>
      )}
    </div>
  );
}
