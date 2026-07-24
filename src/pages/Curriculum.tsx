import React from "react";
import { useSearchParams, useNavigate } from "react-router";
import YearsPanel from "../components/pages/curriculum/YearsPanel";
import ModulesPanel from "../components/pages/curriculum/ModulesPanel";
import SubjectsPanel from "../components/pages/curriculum/SubjectsPanel";
import LecturesPanel from "../components/pages/curriculum/LecturesPanel";

import {
  useCurriculum,
  useModules,
  useSubjectsAndLectures,
  useCurriculumStats,
} from "../hooks/useCurriculum";
import PageHeader from "../components/shared/PageHeader";
       
import KPIGrid from "../components/shared/KPIGrid";
import {
  Calendar,
  BookOpen,
  Bookmark,
  FileText,
  ChevronRight,
  Home,
} from "lucide-react";
import { cn } from "../lib/utils";

export const Curriculum: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract navigation parameters from URL query params
  const yearId = searchParams.get("yearId");
  const moduleId = searchParams.get("moduleId");
  const subjectId = searchParams.get("subjectId");

  // Load curriculum query data to derive breadcrumb names
  const { years } = useCurriculum();
  const { modules } = useModules(yearId);
  const { subjects } = useSubjectsAndLectures(moduleId);
  const { stats, isLoadingStats } = useCurriculumStats();

  const selectedYear = years.find((y) => y.id === yearId);
  const selectedModule = modules.find((m) => m.id === moduleId);
  const selectedSubject = subjects.find((s) => s.id === subjectId);

  const handleSelectLecture = (id: string | null, _name: string) => {
    if (!id) return;
    navigate(`/curriculum/lecture/${encodeURIComponent(id)}`);
  };

  // Helper selectors to navigate by modifying search params
  const navigateToYears = () => setSearchParams({});
  const navigateToModules = (yId: string) => setSearchParams({ yearId: yId });
  const navigateToSubjects = (yId: string, mId: string) =>
    setSearchParams({ yearId: yId, moduleId: mId });
  const navigateToLectures = (yId: string, mId: string, sId: string) =>
    setSearchParams({ yearId: yId, moduleId: mId, subjectId: sId });

  // Render active panel based on URL state
  const renderActivePanel = () => {
    if (subjectId && yearId && moduleId) {
      return (
        <LecturesPanel
          selectedModuleId={moduleId}
          selectedSubjectId={subjectId}
          subjectName={selectedSubject?.name || ""}
          onBack={() => navigateToSubjects(yearId, moduleId)}
          onSelectLecture={handleSelectLecture}
        />
      );
    }

    if (moduleId && yearId) {
      return (
        <SubjectsPanel
          selectedModuleId={moduleId}
          moduleName={selectedModule?.name || ""}
          onBack={() => navigateToModules(yearId)}
          onSelectSubject={(sId) => navigateToLectures(yearId, moduleId, sId)}
        />
      );
    }

    if (yearId) {
      return (
        <ModulesPanel
          selectedYearId={yearId}
          yearName={selectedYear?.name}
          onBack={navigateToYears}
          onSelectModule={(mId) => navigateToSubjects(yearId, mId)}
        />
      );
    }

    return <YearsPanel onSelectYear={navigateToModules} />;
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="animate-fade-in-up stagger-1">
        <PageHeader title="Curriculum Management" />
      </div>

      {/* Horizontal KPIs Grid */}
      <div className="animate-fade-in-up stagger-2">
        <KPIGrid 
        cards={[
          { title: "Academic Years", value: isLoadingStats ? "..." : stats.yearsCount, icon: <Calendar /> },
          { title: "Course Modules", value: isLoadingStats ? "..." : stats.modulesCount, icon: <BookOpen /> },
          { title: "Subjects", value: isLoadingStats ? "..." : stats.subjectsCount, icon: <Bookmark /> },
          { title: "Lectures", value: isLoadingStats ? "..." : stats.lecturesCount, icon: <FileText /> },
        ]}
        compact 
        colorful 
        className="gap-4" 
      />

      </div>

      {/* Page-level Interactive Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-card px-4 py-2.5 rounded-[8px] border border-border/60 glass shadow-sm w-fit animate-fade-in-up stagger-3">
        <span
          className={cn(
            "transition-colors flex items-center gap-1",
            selectedYear || selectedModule || selectedSubject
              ? "hover:text-foreground cursor-pointer font-medium"
              : "text-primary font-semibold px-2 py-0.5 bg-gradient-to-r from-primary/10 to-chart-5/10 rounded-md shadow-sm",
          )}
          onClick={navigateToYears}
        >
          <Home className="h-3.5 w-3.5" />
          <span>Curriculum</span>
        </span>
        {selectedYear && (
          <>
            <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
            <span
              className={cn(
                "transition-colors",
                selectedModule || selectedSubject
                  ? "hover:text-foreground cursor-pointer font-medium"
                  : "text-primary font-semibold px-2 py-0.5 bg-gradient-to-r from-primary/10 to-chart-5/10 rounded-md shadow-sm",
              )}
              onClick={() => navigateToModules(selectedYear.id)}
            >
              {selectedYear.name}
            </span>
            {selectedModule && (
              <>
                <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                <span
                  className={cn(
                    "transition-colors",
                    selectedSubject
                      ? "hover:text-foreground cursor-pointer font-medium"
                      : "text-primary font-semibold px-2 py-0.5 bg-gradient-to-r from-primary/10 to-chart-5/10 rounded-md shadow-sm",
                  )}
                  onClick={() =>
                    navigateToSubjects(selectedYear.id, selectedModule.id)
                  }
                >
                  {selectedModule.name}
                </span>
                {selectedSubject && (
                  <>
                    <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                    <span className="font-semibold text-primary px-2 py-0.5 bg-gradient-to-r from-primary/10 to-chart-5/10 rounded-md shadow-sm">
                      {selectedSubject.name}
                    </span>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Workspace Panel */}
      <div className="w-full animate-fade-in-up stagger-4">
        {renderActivePanel()}
      </div>
    </div>
  );
};

export default Curriculum;
