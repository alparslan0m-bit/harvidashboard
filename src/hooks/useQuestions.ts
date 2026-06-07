import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { QUERY_KEYS } from "../lib/queryKeys";
import { toast } from "sonner";
import type { Question, Lecture } from "../types/database";

export interface QuestionFiltersState {
  yearId: string | null;
  moduleId: string | null;
  subjectId: string | null;
  lectureId: string | null;
}

export function useQuestions(
  filters: QuestionFiltersState,
  page: number,
  search: string
) {
  const pageSize = 25;

  const questionsQuery = useQuery({
    queryKey: QUERY_KEYS.questions({ ...filters }, page, search),
    queryFn: async () => {
      try {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Base query
        let query = supabaseAdmin
          .from("questions")
          .select("*, lectures(id, name)", { count: "exact" });

        // Apply search in text
        if (search.trim()) {
          query = query.ilike("text", `%${search}%`);
        }

        // Apply cascading filters
        if (filters.lectureId) {
          query = query.eq("lecture_id", filters.lectureId);
        } else if (filters.subjectId) {
          // Join subjects via lectures
          const { data: lectures } = await supabaseAdmin
            .from("lectures")
            .select("id")
            .eq("subject_id", filters.subjectId);
          const ids = (lectures || []).map((l) => l.id);
          query = query.in("lecture_id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);
        } else if (filters.moduleId) {
          // Join modules via subjects & lectures
          const { data: subjects } = await supabaseAdmin
            .from("subjects")
            .select("id")
            .eq("module_id", filters.moduleId);
          const sIds = (subjects || []).map((s) => s.id);
          
          if (sIds.length > 0) {
            const { data: lectures } = await supabaseAdmin
              .from("lectures")
              .select("id")
              .in("subject_id", sIds);
            const ids = (lectures || []).map((l) => l.id);
            query = query.in("lecture_id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);
          } else {
            query = query.in("lecture_id", ["00000000-0000-0000-0000-000000000000"]);
          }
        } else if (filters.yearId) {
          // Join years via modules, subjects, & lectures
          const { data: modules } = await supabaseAdmin
            .from("modules")
            .select("id")
            .eq("year_id", filters.yearId);
          const mIds = (modules || []).map((m) => m.id);

          if (mIds.length > 0) {
            const { data: subjects } = await supabaseAdmin
              .from("subjects")
              .select("id")
              .in("module_id", mIds);
            const sIds = (subjects || []).map((s) => s.id);

            if (sIds.length > 0) {
              const { data: lectures } = await supabaseAdmin
                .from("lectures")
                .select("id")
                .in("subject_id", sIds);
              const ids = (lectures || []).map((l) => l.id);
              query = query.in("lecture_id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);
            } else {
              query = query.in("lecture_id", ["00000000-0000-0000-0000-000000000000"]);
            }
          } else {
            query = query.in("lecture_id", ["00000000-0000-0000-0000-000000000000"]);
          }
        }

        const { data, count, error } = await query
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) throw error;

        return {
          questions: (data || []).map((row: any) => ({
            id: row.id,
            lecture_id: row.lecture_id,
            text: row.text,
            image_url: row.image_url,
            options: (row.options || []).map((o: any) =>
              typeof o === "string" ? o : o?.text ?? ""
            ),
            correct_answer_index: row.correct_answer_index,
            explanation: row.explanation,
            question_order: row.question_order || 0,
            created_at: row.created_at,
            updated_at: row.updated_at,
            lectures: row.lectures,
          })) as (Question & { lectures: Lecture | null })[],
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        };
      } catch (err: any) {
        throw new Error(err.message || "Failed to fetch question bank");
      }
    },
  });

  return {
    data: questionsQuery.data,
    isLoading: questionsQuery.isLoading,
    error: questionsQuery.error,
    refetch: questionsQuery.refetch,
  };
}

export function useQuestionMutations() {
  const queryClient = useQueryClient();

  const createQuestionMutation = useMutation({
    mutationFn: async (payload: Omit<Question, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabaseAdmin
        .from("questions")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Question created successfully");
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create question");
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async (payload: { id: string } & Partial<Omit<Question, "id" | "created_at" | "updated_at">>) => {
      const { data, error } = await supabaseAdmin
        .from("questions")
        .update(payload)
        .eq("id", payload.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Question updated successfully");
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update question");
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAdmin.from("questions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Question deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete question");
    },
  });

  return {
    createQuestion: createQuestionMutation.mutateAsync,
    updateQuestion: updateQuestionMutation.mutateAsync,
    deleteQuestion: deleteQuestionMutation.mutateAsync,
  };
}
