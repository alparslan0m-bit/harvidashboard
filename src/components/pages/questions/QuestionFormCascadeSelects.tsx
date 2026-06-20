import { GraduationCap, ChevronDown } from "lucide-react";
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
  const selectClassName =
    "w-full rounded-lg border border-input bg-background px-3 py-2 pr-9 text-sm text-foreground outline-none appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-muted/20";

  return (
    <div className="space-y-3 bg-gradient-to-b from-muted/30 to-muted/10 p-4 rounded-xl border border-border/50 shadow-xs">
      <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-primary/70">
        <GraduationCap className="h-3.5 w-3.5" />
        Select Lecture Topic
      </h4>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-primary font-semibold">
            Year
          </label>
          <div className="relative">
            <select
              value={selYear}
              onChange={(e) => onYearChange(e.target.value)}
              className={selectClassName}
            >
              <option value="">Select Year</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-primary font-semibold">
            Module
          </label>
          <div className="relative">
            <select
              value={selModule}
              onChange={(e) => onModuleChange(e.target.value)}
              disabled={!selYear}
              className={selectClassName}
            >
              <option value="">Select Module</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-primary font-semibold">
            Subject
          </label>
          <div className="relative">
            <select
              value={selSubject}
              onChange={(e) => onSubjectChange(e.target.value)}
              disabled={!selModule}
              className={selectClassName}
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-primary font-semibold">
            Lecture
          </label>
          <div className="relative">
            <select
              {...register("lecture_id")}
              disabled={!selSubject}
              className={selectClassName}
            >
              <option value="">Select Lecture</option>
              {lectures.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          {errors.lecture_id && (
            <p className="text-xs text-red-500">{errors.lecture_id.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
