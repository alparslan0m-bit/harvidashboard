import React, { useEffect, useState } from "react";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import type { QuestionFiltersState } from "../../../hooks/useQuestions";
import { Search } from "lucide-react";

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

  // Fetch Years initially
  useEffect(() => {
    supabaseAdmin
      .from("years")
      .select("id, name")
      .order("name", { ascending: true })
      .then(({ data }) => setYears(data || []));
  }, []);

  // Fetch Modules when Year changes
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

  // Fetch Subjects when Module changes
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

  // Fetch Lectures when Subject changes
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

  // Cascading Select Handlers
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
    <div className="space-y-4 bg-card border p-4 rounded-xl shadow-sm select-none">
      {/* Cascading Select Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Year */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Year</label>
          <select
            value={filters.yearId || ""}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none transition"
            aria-label="Year Selector"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </select>
        </div>

        {/* Module */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Module</label>
          <select
            value={filters.moduleId || ""}
            onChange={(e) => handleModuleChange(e.target.value)}
            disabled={!filters.yearId}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none transition disabled:opacity-50"
            aria-label="Module Selector"
          >
            <option value="">All Modules</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Subject</label>
          <select
            value={filters.subjectId || ""}
            onChange={(e) => handleSubjectChange(e.target.value)}
            disabled={!filters.moduleId}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none transition disabled:opacity-50"
            aria-label="Subject Selector"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Lecture */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Lecture</label>
          <select
            value={filters.lectureId || ""}
            onChange={(e) => handleLectureChange(e.target.value)}
            disabled={!filters.subjectId}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none transition disabled:opacity-50"
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
          className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
          placeholder="Search question content text..."
          aria-label="Search Question Content"
        />
      </div>
    </div>
  );
};
export default QuestionFilters;
