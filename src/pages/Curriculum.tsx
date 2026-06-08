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
import { Calendar, BookOpen, Bookmark, FileText, ChevronRight } from "lucide-react";
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
    <div className="space-y-6">
      <PageHeader
        title="Curriculum Management"
        description="Configure academic levels, modules, subjects, and lectures in full-width workspace panels. Click items to drill down."
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        <MetricCard
          title="Academic Years"
          value={isLoadingStats ? "..." : stats.yearsCount}
          icon={<Calendar />}
          color="indigo"
        />
        <MetricCard
          title="Course Modules"
          value={isLoadingStats ? "..." : stats.modulesCount}
          icon={<BookOpen />}
          color="emerald"
        />
        <MetricCard
          title="Subjects"
          value={isLoadingStats ? "..." : stats.subjectsCount}
          icon={<Bookmark />}
          color="amber"
        />
        <MetricCard
          title="Lectures"
          value={isLoadingStats ? "..." : stats.lecturesCount}
          icon={<FileText />}
          color="zinc"
        />
      </div>

      {/* Page-level Interactive Breadcrumbs */}
      {(selectedYear || selectedModule || selectedSubject) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/40 select-none w-fit">
          <span className="hover:text-foreground cursor-pointer transition-colors" onClick={navigateToYears}>
            Curriculum
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          {selectedYear && (
            <>
              <span
                className={cn(
                  "transition-colors font-semibold",
                  selectedModule || selectedSubject ? "hover:text-foreground cursor-pointer" : "text-foreground font-bold"
                )}
                onClick={() => navigateToModules(selectedYear.id)}
              >
                {selectedYear.name}
              </span>
              {selectedModule && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <span
                    className={cn(
                      "transition-colors font-semibold",
                      selectedSubject ? "hover:text-foreground cursor-pointer" : "text-foreground font-bold"
                    )}
                    onClick={() => navigateToSubjects(selectedYear.id, selectedModule.id)}
                  >
                    {selectedModule.name}
                  </span>
                  {selectedSubject && (
                    <>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                      <span className="font-bold text-foreground">
                        {selectedSubject.name}
                      </span>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Full-width Sequential Workspace Panel */}
      <div className="w-full">
        {renderActivePanel()}
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
