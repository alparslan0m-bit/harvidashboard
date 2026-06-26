import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import { useQuestions, useQuestionMutations } from "@/hooks/useQuestions";
import { createQuestionColumns } from "@/components/pages/questions/questionsColumns";
import type { Question } from "@/types/database";

export function useQuestionsPage() {
  const { search: routerSearch } = useLocation();
  const initialLectureId = new URLSearchParams(routerSearch).get("lectureId");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    yearId: null as string | null,
    moduleId: null as string | null,
    subjectId: null as string | null,
    lectureId: initialLectureId as string | null,
  });
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuestions(filters, page, search);
  const { deleteQuestion } = useQuestionMutations();

  useEffect(() => {
    if (initialLectureId) {
      setFilters((prev) => ({ ...prev, lectureId: initialLectureId }));
    }
  }, [initialLectureId]);

  const columns = useMemo(
    () =>
      createQuestionColumns(
        page,
        (q) => { setSelectedQuestion(q); setIsFormOpen(true); },
        setDeleteQuestionId,
      ),
    [page],
  );

  return {
    page,
    setPage,
    search,
    filters,
    setFilters: (f: typeof filters) => { setFilters(f); setPage(1); },
    setSearch: (val: string) => { setSearch(val); setPage(1); },
    selectedQuestion,
    isFormOpen,
    deleteQuestionId,
    data,
    isLoading,
    error,
    refetch,
    columns,
    closeForm: () => { setIsFormOpen(false); setSelectedQuestion(null); },
    confirmDelete: async () => {
      if (deleteQuestionId) {
        await deleteQuestion(deleteQuestionId);
        setDeleteQuestionId(null);
      }
    },
    clearDelete: () => setDeleteQuestionId(null),
  };
}


