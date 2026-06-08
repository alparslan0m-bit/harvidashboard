import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { QuestionFormValues } from "@/schemas/questionFormSchema";

interface QuestionFormCascadeSelectsProps {
  years: { id: string; name: string }[];
  modules: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  lectures: { id: string; name: string }[];
  selYear: string;
  selModule: string;
  selSubject: string;
  register: UseFormRegister<QuestionFormValues>;
  errors: FieldErrors<QuestionFormValues>;
  onYearChange: (yearId: string) => void;
  onModuleChange: (moduleId: string) => void;
  onSubjectChange: (subjectId: string) => void;
}

export function QuestionFormCascadeSelects({
  years,
  modules,
  subjects,
  lectures,
  selYear,
  selModule,
  selSubject,
  register,
  errors,
  onYearChange,
  onModuleChange,
  onSubjectChange,
}: QuestionFormCascadeSelectsProps) {
  return (
    <div className="space-y-3 bg-muted/20 p-3 rounded-lg border">
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Select Lecture Topic
      </h4>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground font-semibold">Year</label>
          <select
            value={selYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="w-full rounded border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none"
          >
            <option value="">Select Year</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground font-semibold">Module</label>
          <select
            value={selModule}
            onChange={(e) => onModuleChange(e.target.value)}
            disabled={!selYear}
            className="w-full rounded border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none disabled:opacity-50"
          >
            <option value="">Select Module</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground font-semibold">Subject</label>
          <select
            value={selSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            disabled={!selModule}
            className="w-full rounded border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none disabled:opacity-50"
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
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
            {lectures.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          {errors.lecture_id && (
            <p className="text-[10px] text-red-500">{errors.lecture_id.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
