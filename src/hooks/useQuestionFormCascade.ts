import { useEffect, useState } from "react";
import type { UseFormReset, UseFormSetValue } from "react-hook-form";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Question } from "@/types/database";
import type { QuestionFormValues } from "@/schemas/questionFormSchema";

interface UseQuestionFormCascadeOptions {
  question: Question | null;
  isOpen: boolean;
  initialLectureId?: string | null;
  reset: UseFormReset<QuestionFormValues>;
  setValue: UseFormSetValue<QuestionFormValues>;
}

export function useQuestionFormCascade({
  question,
  isOpen,
  initialLectureId,
  reset,
  setValue,
}: UseQuestionFormCascadeOptions) {
  const [years, setYears] = useState<{ id: string; name: string }[]>([]);
  const [modules, setModules] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [lectures, setLectures] = useState<{ id: string; name: string }[]>([]);

  const [selYear, setSelYear] = useState("");
  const [selModule, setSelModule] = useState("");
  const [selSubject, setSelSubject] = useState("");

  useEffect(() => {
    supabaseAdmin
      .from("years")
      .select("id, name")
      .order("name", { ascending: true })
      .then(({ data }) => setYears(data || []));
  }, []);

  useEffect(() => {
    const hydrateChain = async () => {
      let activeLectureId = question?.lecture_id || initialLectureId;
      if (!activeLectureId) return;

      try {
        const { data: lect } = await supabaseAdmin
          .from("lectures")
          .select("*, subjects(*, modules(*))")
          .eq("id", activeLectureId)
          .single();

        if (lect) {
          const subject = (lect as any).subjects;
          const module = subject?.modules;
          const yearId = module?.year_id;

          setSelYear(yearId || "");
          setSelModule(module?.id || "");
          setSelSubject(subject?.id || "");

          if (yearId) {
            const { data: mods } = await supabaseAdmin
              .from("modules")
              .select("id, name")
              .eq("year_id", yearId);
            setModules(mods || []);
          }
          if (module?.id) {
            const { data: subjs } = await supabaseAdmin
              .from("subjects")
              .select("id, name")
              .eq("module_id", module.id);
            setSubjects(subjs || []);
          }
          if (subject?.id) {
            const { data: lects } = await supabaseAdmin
              .from("lectures")
              .select("id, name")
              .eq("subject_id", subject.id);
            setLectures(lects || []);
          }

          setValue("lecture_id", activeLectureId);
        }
      } catch {
        // Fallback silently
      }
    };

    if (isOpen) {
      if (question) {
        reset({
          lecture_id: question.lecture_id,
          text: question.text,
          image_url: question.image_url || "",
          options: question.options,
          correct_answer_index: question.correct_answer_index,
          explanation: question.explanation || "",
        });
        hydrateChain();
      } else {
        reset({
          lecture_id: initialLectureId || "",
          text: "",
          image_url: "",
          options: ["", "", "", ""],
          correct_answer_index: 0,
          explanation: "",
        });
        if (initialLectureId) {
          hydrateChain();
        } else {
          setSelYear("");
          setSelModule("");
          setSelSubject("");
          setModules([]);
          setSubjects([]);
          setLectures([]);
        }
      }
    }
  }, [question, isOpen, initialLectureId, reset, setValue]);

  const handleYearChange = async (yearId: string) => {
    setSelYear(yearId);
    setSelModule("");
    setSelSubject("");
    setValue("lecture_id", "");
    setSubjects([]);
    setLectures([]);

    if (yearId) {
      const { data } = await supabaseAdmin.from("modules").select("id, name").eq("year_id", yearId);
      setModules(data || []);
    } else {
      setModules([]);
    }
  };

  const handleModuleChange = async (moduleId: string) => {
    setSelModule(moduleId);
    setSelSubject("");
    setValue("lecture_id", "");
    setLectures([]);

    if (moduleId) {
      const { data } = await supabaseAdmin.from("subjects").select("id, name").eq("module_id", moduleId);
      setSubjects(data || []);
    } else {
      setSubjects([]);
    }
  };

  const handleSubjectChange = async (subjectId: string) => {
    setSelSubject(subjectId);
    setValue("lecture_id", "");

    if (subjectId) {
      const { data } = await supabaseAdmin.from("lectures").select("id, name").eq("subject_id", subjectId);
      setLectures(data || []);
    } else {
      setLectures([]);
    }
  };

  return {
    years,
    modules,
    subjects,
    lectures,
    selYear,
    selModule,
    selSubject,
    handleYearChange,
    handleModuleChange,
    handleSubjectChange,
  };
}
