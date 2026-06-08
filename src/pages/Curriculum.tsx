import React from "react";
import { useSearchParams } from "react-router";
import YearsPanel from "../components/pages/curriculum/YearsPanel";
import ModulesPanel from "../components/pages/curriculum/ModulesPanel";
import SubjectsPanel from "../components/pages/curriculum/SubjectsPanel";
import LecturesPanel from "../components/pages/curriculum/LecturesPanel";
import LectureQuestionsPanel from "../components/pages/curriculum/LectureQuestionsPanel";

import { useCurriculum, useModules, useSubjectsAndLectures, useCurriculumStats } from "../hooks/useCurriculum";
import PageHeader from "../components/shared/PageHeader";
import MetricCard from "../components/shared/MetricCard";
import { Calendar, BookOpen, Bookmark, FileText, ChevronRight, Home } from "lucide-react";
import { cn } from "../lib/utils";

export const Curriculum: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract navigation parameters from URL query params
  const yearId = searchParams.get("yearId");
  const moduleId = searchParams.get("moduleId");
  const subjectId = searchParams.get("subjectId");

  // Lecture Slide-over details state
  const [selectedLectureId, setSelectedLectureId] = React.useState<string | null>(null);
  const [selectedLectureName, setSelectedLectureName] = React.useState("");
  const [isLectureQuestionsOpen, setIsLectureQuestionsOpen] = React.useState(false);

  // Load curriculum query data to derive breadcrumb names
  const { years } = useCurriculum();
  const { modules } = useModules(yearId);
  const { subjects } = useSubjectsAndLectures(moduleId);
  const { stats, isLoadingStats } = useCurriculumStats();

  const selectedYear = years.find((y) => y.id === yearId);
  const selectedModule = modules.find((m) => m.id === moduleId);
  const selectedSubject = subjects.find((s) => s.id === subjectId);

  const handleSelectLecture = (id: string | null, name: string) => {
    setSelectedLectureId(id);
    setSelectedLectureName(name);
    setIsLectureQuestionsOpen(true);
  };

  // Helper selectors to navigate by modifying search params
  const navigateToYears = () => setSearchParams({});
  const navigateToModules = (yId: string) => setSearchParams({ yearId: yId });
  const navigateToSubjects = (yId: string, mId: string) => setSearchParams({ yearId: yId, moduleId: mId });
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

    return (
      <YearsPanel
        onSelectYear={navigateToModules}
      />
    );
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Curriculum Management"
      />

      {/* Page-level Interactive Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-card px-3.5 py-2 rounded-full border border-border/60 shadow-xs w-fit">
        <span
          className={cn(
            "transition-colors flex items-center gap-1",
            selectedYear || selectedModule || selectedSubject ? "hover:text-foreground cursor-pointer font-medium" : "text-foreground font-semibold px-2 py-0.5 bg-muted rounded-md"
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
                selectedModule || selectedSubject ? "hover:text-foreground cursor-pointer font-medium" : "text-foreground font-semibold px-2 py-0.5 bg-muted rounded-md"
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
                    selectedSubject ? "hover:text-foreground cursor-pointer font-medium" : "text-foreground font-semibold px-2 py-0.5 bg-muted rounded-md"
                  )}
                  onClick={() => navigateToSubjects(selectedYear.id, selectedModule.id)}
                >
                  {selectedModule.name}
                </span>
                {selectedSubject && (
                  <>
                    <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                    <span className="font-semibold text-foreground px-2 py-0.5 bg-muted rounded-md">
                      {selectedSubject.name}
                    </span>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Grid Layout: Active workspace panel on the left, compact stats cards on the right side */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Workspace Panel */}
        <div className="lg:col-span-3 w-full order-last lg:order-first">
          {renderActivePanel()}
        </div>

        {/* Stats Bar on the side (vertical stack) */}
        <div className="lg:col-span-1 flex flex-col gap-3.5">
          <MetricCard
            title="Academic Years"
            value={isLoadingStats ? "..." : stats.yearsCount}
            icon={<Calendar />}
            color="sky"
            compact
          />
          <MetricCard
            title="Course Modules"
            value={isLoadingStats ? "..." : stats.modulesCount}
            icon={<BookOpen />}
            color="emerald"
            compact
          />
          <MetricCard
            title="Subjects"
            value={isLoadingStats ? "..." : stats.subjectsCount}
            icon={<Bookmark />}
            color="amber"
            compact
          />
          <MetricCard
            title="Lectures"
            value={isLoadingStats ? "..." : stats.lecturesCount}
            icon={<FileText />}
            color="zinc"
            compact
          />
        </div>
      </div>

      {/* Lecture questions slide-over drawer */}
      <LectureQuestionsPanel
        lectureId={selectedLectureId}
        lectureName={selectedLectureName}
        isOpen={isLectureQuestionsOpen}
        onClose={() => {
          setIsLectureQuestionsOpen(false);
          setSelectedLectureId(null);
          setSelectedLectureName("");
        }}
      />
    </div>
  );
};

export default Curriculum;
