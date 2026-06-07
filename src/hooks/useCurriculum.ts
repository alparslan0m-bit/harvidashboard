import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { QUERY_KEYS } from "../lib/queryKeys";
import { toast } from "sonner";
import type { Year, Module, Subject, Lecture, Question } from "../types/database";

export function useCurriculum() {
  const queryClient = useQueryClient();

  // --- YEARS QUERIES & MUTATIONS ---
  const yearsQuery = useQuery({
    queryKey: QUERY_KEYS.years,
    queryFn: async (): Promise<Year[]> => {
      // Order by order_index if it exists, fallback to name
      const { data, error } = await supabaseAdmin
        .from("years")
        .select("*")
        .order("name", { ascending: true }); // Base years order, let's also order by order_index in js if present

      if (error) throw error;
      
      // Sort in memory by order_index if it exists in data
      const sorted = (data || []).map((row: any) => ({
        ...row,
        order_index: row.order_index ?? 0,
      })) as Year[];
      
      return sorted.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    },
  });

  const createYearMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabaseAdmin
        .from("years")
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Academic year created");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.years });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create year");
    },
  });

  const updateYearMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabaseAdmin
        .from("years")
        .update({ name })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Academic year updated");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.years });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update year");
    },
  });

  const deleteYearMutation = useMutation({
    mutationFn: async (id: string) => {
      // Check for child modules
      const { count } = await supabaseAdmin
        .from("modules")
        .select("id", { count: "exact", head: true })
        .eq("year_id", id);

      if (count && count > 0) {
        throw new Error("Cannot delete year with associated modules");
      }

      const { error } = await supabaseAdmin.from("years").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Academic year deleted");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.years });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete year");
    },
  });

  const reorderYearsMutation = useMutation({
    mutationFn: async (items: { id: string; order_index: number }[]) => {
      // Check if years has order_index column by updating one item
      // Wait, let's bulk update
      const promises = items.map((item) =>
        supabaseAdmin.from("years").update({ order_index: item.order_index }).eq("id", item.id)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.years });
    },
    onError: () => {
      toast.error("Failed to update year orders");
    },
  });

  return {
    years: yearsQuery.data || [],
    isLoadingYears: yearsQuery.isLoading,
    createYear: createYearMutation.mutateAsync,
    updateYear: updateYearMutation.mutateAsync,
    deleteYear: deleteYearMutation.mutateAsync,
    reorderYears: reorderYearsMutation.mutateAsync,
  };
}

export function useModules(yearId: string | null) {
  const queryClient = useQueryClient();

  const modulesQuery = useQuery({
    queryKey: QUERY_KEYS.modules(yearId),
    queryFn: async (): Promise<Module[]> => {
      if (!yearId) return [];
      const { data, error } = await supabaseAdmin
        .from("modules")
        .select("*")
        .eq("year_id", yearId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!yearId,
  });

  const createModuleMutation = useMutation({
    mutationFn: async (payload: { name: string; is_free: boolean; price_cents: number }) => {
      if (!yearId) throw new Error("No Year selected");
      const { data, error } = await supabaseAdmin
        .from("modules")
        .insert({
          year_id: yearId,
          name: payload.name,
          is_free: payload.is_free,
          price_cents: payload.is_free ? 0 : payload.price_cents,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Module created successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modules(yearId) });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create module");
    },
  });

  const updateModuleMutation = useMutation({
    mutationFn: async (payload: { id: string; name: string; is_free: boolean; price_cents: number }) => {
      const { data, error } = await supabaseAdmin
        .from("modules")
        .update({
          name: payload.name,
          is_free: payload.is_free,
          price_cents: payload.is_free ? 0 : payload.price_cents,
        })
        .eq("id", payload.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Module updated successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modules(yearId) });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update module");
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: async (id: string) => {
      // Check child subjects
      const { count } = await supabaseAdmin
        .from("subjects")
        .select("id", { count: "exact", head: true })
        .eq("module_id", id);

      if (count && count > 0) {
        throw new Error("Cannot delete module with associated subjects");
      }

      const { error } = await supabaseAdmin.from("modules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Module deleted successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modules(yearId) });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete module");
    },
  });

  const reorderModulesMutation = useMutation({
    mutationFn: async (items: { id: string; order_index: number }[]) => {
      const promises = items.map((item) =>
        supabaseAdmin.from("modules").update({ order_index: item.order_index }).eq("id", item.id)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modules(yearId) });
    },
    onError: () => {
      toast.error("Failed to update module orders");
    },
  });

  return {
    modules: modulesQuery.data || [],
    isLoadingModules: modulesQuery.isLoading,
    createModule: createModuleMutation.mutateAsync,
    updateModule: updateModuleMutation.mutateAsync,
    deleteModule: deleteModuleMutation.mutateAsync,
    reorderModules: reorderModulesMutation.mutateAsync,
  };
}

export function useSubjectsAndLectures(moduleId: string | null) {
  const queryClient = useQueryClient();

  const subjectsQuery = useQuery({
    queryKey: QUERY_KEYS.subjects(moduleId),
    queryFn: async (): Promise<(Subject & { lectures: Lecture[] })[]> => {
      if (!moduleId) return [];
      
      // Fetch subjects
      const { data: subjectsData, error: sError } = await supabaseAdmin
        .from("subjects")
        .select("*")
        .eq("module_id", moduleId)
        .order("order_index", { ascending: true });

      if (sError) throw sError;

      // Fetch lectures for all subjects
      const subjectIds = (subjectsData || []).map((s) => s.id);
      if (subjectIds.length === 0) return [];

      const { data: lecturesData, error: lError } = await supabaseAdmin
        .from("lectures")
        .select("*")
        .in("subject_id", subjectIds)
        .order("order_index", { ascending: true });

      if (lError) throw lError;

      return (subjectsData || []).map((subj) => ({
        ...subj,
        lectures: (lecturesData || []).filter((lect) => lect.subject_id === subj.id),
      }));
    },
    enabled: !!moduleId,
  });

  const createSubjectMutation = useMutation({
    mutationFn: async (payload: { name: string; is_free: boolean; price_cents: number }) => {
      if (!moduleId) throw new Error("No Module selected");
      const { data, error } = await supabaseAdmin
        .from("subjects")
        .insert({
          module_id: moduleId,
          name: payload.name,
          is_free: payload.is_free,
          price_cents: payload.is_free ? 0 : payload.price_cents,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Subject created successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects(moduleId) });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create subject");
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: async (payload: { id: string; name: string; is_free: boolean; price_cents: number }) => {
      const { data, error } = await supabaseAdmin
        .from("subjects")
        .update({
          name: payload.name,
          is_free: payload.is_free,
          price_cents: payload.is_free ? 0 : payload.price_cents,
        })
        .eq("id", payload.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Subject updated successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects(moduleId) });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update subject");
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (id: string) => {
      // Check child lectures
      const { count } = await supabaseAdmin
        .from("lectures")
        .select("id", { count: "exact", head: true })
        .eq("subject_id", id);

      if (count && count > 0) {
        throw new Error("Cannot delete subject with associated lectures");
      }

      const { error } = await supabaseAdmin.from("subjects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Subject deleted successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects(moduleId) });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete subject");
    },
  });

  const reorderSubjectsMutation = useMutation({
    mutationFn: async (items: { id: string; order_index: number }[]) => {
      const promises = items.map((item) =>
        supabaseAdmin.from("subjects").update({ order_index: item.order_index }).eq("id", item.id)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects(moduleId) });
    },
    onError: () => {
      toast.error("Failed to update subject orders");
    },
  });

  // --- LECTURE MUTATIONS ---
  const createLectureMutation = useMutation({
    mutationFn: async (payload: { subjectId: string; name: string }) => {
      const { data, error } = await supabaseAdmin
        .from("lectures")
        .insert({
          subject_id: payload.subjectId,
          name: payload.name,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Lecture created successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects(moduleId) });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create lecture");
    },
  });

  const updateLectureMutation = useMutation({
    mutationFn: async (payload: { id: string; name: string }) => {
      const { data, error } = await supabaseAdmin
        .from("lectures")
        .update({ name: payload.name })
        .eq("id", payload.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Lecture updated successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects(moduleId) });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update lecture");
    },
  });

  const deleteLectureMutation = useMutation({
    mutationFn: async (id: string) => {
      // Check questions count
      const { count } = await supabaseAdmin
        .from("questions")
        .select("id", { count: "exact", head: true })
        .eq("lecture_id", id);

      if (count && count > 0) {
        throw new Error("Cannot delete lecture with associated questions");
      }

      const { error } = await supabaseAdmin.from("lectures").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lecture deleted successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects(moduleId) });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete lecture");
    },
  });

  const reorderLecturesMutation = useMutation({
    mutationFn: async (items: { id: string; order_index: number }[]) => {
      const promises = items.map((item) =>
        supabaseAdmin.from("lectures").update({ order_index: item.order_index }).eq("id", item.id)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects(moduleId) });
    },
    onError: () => {
      toast.error("Failed to update lecture orders");
    },
  });

  return {
    subjects: subjectsQuery.data || [],
    isLoadingSubjects: subjectsQuery.isLoading,
    createSubject: createSubjectMutation.mutateAsync,
    updateSubject: updateSubjectMutation.mutateAsync,
    deleteSubject: deleteSubjectMutation.mutateAsync,
    reorderSubjects: reorderSubjectsMutation.mutateAsync,
    createLecture: createLectureMutation.mutateAsync,
    updateLecture: updateLectureMutation.mutateAsync,
    deleteLecture: deleteLectureMutation.mutateAsync,
    reorderLectures: reorderLecturesMutation.mutateAsync,
  };
}

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

      if (error) throw error;
      
      return (data || []).map((row: any) => ({
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
      })) as Question[];
    },
    enabled: !!lectureId,
  });

  return {
    questions: questionsQuery.data || [],
    isLoadingQuestions: questionsQuery.isLoading,
    refetch: questionsQuery.refetch,
  };
}
