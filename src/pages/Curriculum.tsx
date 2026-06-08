import React, { useState } from "react";
import YearsPanel from "../components/pages/curriculum/YearsPanel";
import ModulesPanel from "../components/pages/curriculum/ModulesPanel";
import SubjectsPanel from "../components/pages/curriculum/SubjectsPanel";
import LectureQuestionsPanel from "../components/pages/curriculum/LectureQuestionsPanel";

import { useCurriculum, useModules } from "../hooks/useCurriculum";

export const Curriculum: React.FC = () => {
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  
  // Lecture Slide-over details
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [selectedLectureName, setSelectedLectureName] = useState("");
  const [isLectureQuestionsOpen, setIsLectureQuestionsOpen] = useState(false);

  // Derive names for breadcrumbs from query caches
  const { years } = useCurriculum();
  const { modules } = useModules(selectedYearId);

  const selectedYear = years.find((y) => y.id === selectedYearId);
  const selectedModule = modules.find((m) => m.id === selectedModuleId);

  const handleSelectYear = (id: string | null) => {
    setSelectedYearId(id);
    setSelectedModuleId(null);
  };

  const handleSelectModule = (id: string | null) => {
    setSelectedModuleId(id);
  };

  const handleSelectLecture = (id: string | null, name: string) => {
    setSelectedLectureId(id);
    setSelectedLectureName(name);
    setIsLectureQuestionsOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="select-none border-b pb-4 mb-4">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Curriculum Hierarchy Tree</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your educational structural layers</p>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <YearsPanel selectedYearId={selectedYearId} onSelectYear={handleSelectYear} />
        
        <ModulesPanel
          selectedYearId={selectedYearId}
          selectedModuleId={selectedModuleId}
          onSelectModule={handleSelectModule}
        />
        
        <SubjectsPanel
          selectedModuleId={selectedModuleId}
          selectedYearName={selectedYear?.name}
          selectedModuleName={selectedModule?.name}
          onSelectLecture={handleSelectLecture}
        />
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
