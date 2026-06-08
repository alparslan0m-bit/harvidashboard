import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { STALE_TIMES } from "@/lib/constants";
import type { Question } from "@/types/database";

export function useLectureQuestions(lectureId: string | null) {
  const questionsQuery = useQuery({
    queryKey: QUERY_KEYS.questionsByLecture(lectureId),
    queryFn: async (): Promise<Question[]> => {
      if (!lectureId) return [];
      const { data, error } = await supabaseAdmin
        .from("questions")
        .select("*")
        .eq("lecture_id", lectureId)
        .order("question_order", { ascending: true });
      if (error) throw new Error(`[Curriculum.lectureQuestionsQuery] ${error.message}`);

      return (data || []).map((row) => ({
        id: row.id,
        lecture_id: row.lecture_id,
        text: row.text,
        image_url: row.image_url,
        options: (row.options || []).map((o: string | { text?: string }) =>
          typeof o === "string" ? o : o?.text ?? "",
        ),
        correct_answer_index: row.correct_answer_index,
        explanation: row.explanation,
        question_order: row.question_order || 0,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })) as Question[];
    },
    enabled: !!lectureId,
    staleTime: STALE_TIMES.curriculum,
  });

  return {
    questions: questionsQuery.data || [],
    isLoadingQuestions: questionsQuery.isLoading,
    refetch: questionsQuery.refetch,
  };
}
