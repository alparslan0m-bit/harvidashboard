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
              className={`rounded-xl border px-3 py-1.5 transition-all duration-200 ${
                isCorrect
                  ? "border-emerald-200 bg-emerald-50 shadow-xs dark:border-emerald-800/30 dark:bg-emerald-950/20"
                  : "border-border/40 bg-card hover:border-border"
              }`}
            >
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => setValue("correct_answer_index", idx)}
                  className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isCorrect
                      ? "bg-emerald-600 border-emerald-600 text-white scale-100"
                      : "bg-background border-input text-transparent hover:border-emerald-600 scale-90"
                  }`}
                  aria-label={`Mark option ${String.fromCharCode(65 + idx)} as correct`}
                >
                  <Check className="h-3 w-3" />
                </button>

                <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                  {String.fromCharCode(65 + idx)}
                </span>

                <input
                  type="text"
                  {...register(`options.${idx}` as any)}
                  className="flex-1 rounded-lg border border-input bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow duration-200"
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
                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-150"
                    aria-label="Remove option"
                  >
                    <Trash className="h-3.5 w-3.5" />
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
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border/50 bg-transparent py-1.5 text-[11px] font-semibold text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Option</span>
        </button>
      )}

      {errors.options && (
        <p className="text-xs text-red-500">{errors.options.message}</p>
      )}
    </div>
  );
}
