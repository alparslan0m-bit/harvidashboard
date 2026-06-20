import React, { useEffect, useState } from "react";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import type { QuestionFiltersState } from "../../../hooks/useQuestions";
import { Search, X } from "lucide-react";

const selectClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none appearance-none bg-[length:16px_16px] bg-[position:right_10px_center] bg-no-repeat transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]";

const selectDisabledClass = "disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-muted/30";

interface QuestionFiltersProps {
  filters: QuestionFiltersState;
  onFiltersChange: (filters: QuestionFiltersState) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  filters,
  onFiltersChange,
  search,
  onSearchChange,
}) => {
  const [years, setYears] = useState<{ id: string; name: string }[]>([]);
  const [modules, setModules] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [lectures, setLectures] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    supabaseAdmin
      .from("years")
      .select("id, name")
      .order("name", { ascending: true })
      .then(({ data }) => setYears(data || []));
  }, []);

  useEffect(() => {
    if (filters.yearId) {
      supabaseAdmin
        .from("modules")
        .select("id, name")
        .eq("year_id", filters.yearId)
        .order("order_index", { ascending: true })
        .then(({ data }) => setModules(data || []));
    } else {
      setModules([]);
    }
  }, [filters.yearId]);

  useEffect(() => {
    if (filters.moduleId) {
      supabaseAdmin
        .from("subjects")
        .select("id, name")
        .eq("module_id", filters.moduleId)
        .order("order_index", { ascending: true })
        .then(({ data }) => setSubjects(data || []));
    } else {
      setSubjects([]);
    }
  }, [filters.moduleId]);

  useEffect(() => {
    if (filters.subjectId) {
      supabaseAdmin
        .from("lectures")
        .select("id, name")
        .eq("subject_id", filters.subjectId)
        .order("order_index", { ascending: true })
        .then(({ data }) => setLectures(data || []));
    } else {
      setLectures([]);
    }
  }, [filters.subjectId]);

  const handleYearChange = (yearId: string) => {
    onFiltersChange({
      yearId: yearId || null,
      moduleId: null,
      subjectId: null,
      lectureId: null,
    });
  };

  const handleModuleChange = (moduleId: string) => {
    onFiltersChange({
      ...filters,
      moduleId: moduleId || null,
      subjectId: null,
      lectureId: null,
    });
  };

  const handleSubjectChange = (subjectId: string) => {
    onFiltersChange({
      ...filters,
      subjectId: subjectId || null,
      lectureId: null,
    });
  };

  const handleLectureChange = (lectureId: string) => {
    onFiltersChange({
      ...filters,
      lectureId: lectureId || null,
    });
  };

  return (
    <div className="relative space-y-3 bg-muted/30 border border-border/60 p-4 rounded-xl shadow-sm select-none overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />

      {/* Cascading Select Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Year */}
        <div className="space-y-1.5">
          <label className="text-xs uppercase font-bold text-muted-foreground tracking-wide">Year</label>
          <select
            value={filters.yearId || ""}
            onChange={(e) => handleYearChange(e.target.value)}
            className={`${selectClass}`}
            aria-label="Year Selector"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </select>
        </div>

        {/* Module */}
        <div className="space-y-1.5">
          <label className="text-xs uppercase font-bold text-muted-foreground tracking-wide">Module</label>
          <select
            value={filters.moduleId || ""}
            onChange={(e) => handleModuleChange(e.target.value)}
            disabled={!filters.yearId}
            className={`${selectClass} ${selectDisabledClass}`}
            aria-label="Module Selector"
          >
            <option value="">All Modules</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-xs uppercase font-bold text-muted-foreground tracking-wide">Subject</label>
          <select
            value={filters.subjectId || ""}
            onChange={(e) => handleSubjectChange(e.target.value)}
            disabled={!filters.moduleId}
            className={`${selectClass} ${selectDisabledClass}`}
            aria-label="Subject Selector"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Lecture */}
        <div className="space-y-1.5">
          <label className="text-xs uppercase font-bold text-muted-foreground tracking-wide">Lecture</label>
          <select
            value={filters.lectureId || ""}
            onChange={(e) => handleLectureChange(e.target.value)}
            disabled={!filters.subjectId}
            className={`${selectClass} ${selectDisabledClass}`}
            aria-label="Lecture Selector"
          >
            <option value="">All Lectures</option>
            {lectures.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Free Text Search */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-input bg-background pl-9 pr-9 py-2 text-sm text-foreground placeholder-muted-foreground outline-none shadow-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          placeholder="Search question content text..."
          aria-label="Search Question Content"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
export default QuestionFilters;
