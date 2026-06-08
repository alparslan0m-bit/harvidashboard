import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
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
  );
}
