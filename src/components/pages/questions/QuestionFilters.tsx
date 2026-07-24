import React, { useEffect, useState } from "react";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import type { QuestionFiltersState } from "../../../hooks/useQuestions";
import { Search, X } from "lucide-react";

const selectClass =
  "w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground outline-none appearance-none bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]";

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
    let isMounted = true;
    const fetchYears = async () => {
      try {
        const { data, error } = await supabaseAdmin
          .from("years")
          .select("id, name")
          .order("name", { ascending: true });
        if (error) throw error;
        if (isMounted) setYears(data || []);
      } catch (err) {
        console.error("Failed to load years:", err);
      }
    };
    fetchYears();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (filters.yearId) {
      const fetchModules = async () => {
        try {
          const { data, error } = await supabaseAdmin
            .from("modules")
            .select("id, name")
            .eq("year_id", filters.yearId)
            .order("order_index", { ascending: true });
          if (error) throw error;
          if (isMounted) setModules(data || []);
        } catch (err) {
          console.error("Failed to load modules:", err);
        }
      };
      fetchModules();
    } else {
      setModules([]);
    }
    return () => { isMounted = false; };
  }, [filters.yearId]);

  useEffect(() => {
    let isMounted = true;
    if (filters.moduleId) {
      const fetchSubjects = async () => {
        try {
          const { data, error } = await supabaseAdmin
            .from("subjects")
            .select("id, name")
            .eq("module_id", filters.moduleId)
            .order("order_index", { ascending: true });
          if (error) throw error;
          if (isMounted) setSubjects(data || []);
        } catch (err) {
          console.error("Failed to load subjects:", err);
        }
      };
      fetchSubjects();
    } else {
      setSubjects([]);
    }
    return () => { isMounted = false; };
  }, [filters.moduleId]);

  useEffect(() => {
    let isMounted = true;
    if (filters.subjectId) {
      const fetchLectures = async () => {
        try {
          const { data, error } = await supabaseAdmin
            .from("lectures")
            .select("id, name")
            .eq("subject_id", filters.subjectId)
            .order("order_index", { ascending: true });
          if (error) throw error;
          if (isMounted) setLectures(data || []);
        } catch (err) {
          console.error("Failed to load lectures:", err);
        }
      };
      fetchLectures();
    } else {
      setLectures([]);
    }
    return () => { isMounted = false; };
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
    <div className="space-y-4 bg-card border border-border/40 p-5 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-6 w-6 rounded-md flex items-center justify-center bg-muted text-foreground">
          <Search className="h-3.5 w-3.5" />
        </div>
        <h3 className="text-sm font-semibold tracking-tight text-foreground font-heading">Filters & Search</h3>
      </div>

      {/* Cascading Select Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Year */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground/80 flex items-center gap-1.5">Year</label>
          <select
            value={filters.yearId || ""}
            onChange={(e) => handleYearChange(e.target.value)}
            className={`${selectClass} focus:shadow-[0_0_8px_rgba(0,112,243,0.3)]`}
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
          <label className="text-xs font-medium text-muted-foreground/80 flex items-center gap-1.5">Module</label>
          <select
            value={filters.moduleId || ""}
            onChange={(e) => handleModuleChange(e.target.value)}
            disabled={!filters.yearId}
            className={`${selectClass} ${selectDisabledClass} focus:shadow-[0_0_8px_rgba(0,112,243,0.3)]`}
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
          <label className="text-xs font-medium text-muted-foreground/80 flex items-center gap-1.5">Subject</label>
          <select
            value={filters.subjectId || ""}
            onChange={(e) => handleSubjectChange(e.target.value)}
            disabled={!filters.moduleId}
            className={`${selectClass} ${selectDisabledClass} focus:shadow-[0_0_8px_rgba(0,112,243,0.3)]`}
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
          <label className="text-xs font-medium text-muted-foreground/80 flex items-center gap-1.5">Lecture</label>
          <select
            value={filters.lectureId || ""}
            onChange={(e) => handleLectureChange(e.target.value)}
            disabled={!filters.subjectId}
            className={`${selectClass} ${selectDisabledClass} focus:shadow-[0_0_8px_rgba(0,112,243,0.3)]`}
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
          className="w-full rounded-xl border border-input bg-card pl-9 pr-9 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow duration-200"
          placeholder="Search question content text..."
          aria-label="Search Question Content"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
