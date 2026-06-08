import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { STALE_TIMES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import type { SubjectWithLectures } from "@/types/curriculum";
import { normalizePricePayload, reorderItems } from "./reorderItems";

export function useSubjects(moduleId: string | null) {
  const queryClient = useQueryClient();

  const subjectsQuery = useQuery({
    queryKey: QUERY_KEYS.subjects(moduleId),
    queryFn: async (): Promise<SubjectWithLectures[]> => {
      if (!moduleId) return [];
      const { data: subjectsData, error: sError } = await supabaseAdmin
        .from("subjects")
        .select("*")
        .eq("module_id", moduleId)
        .order("order_index", { ascending: true });
      if (sError) throw new Error(`[Curriculum.subjectsQuery] ${sError.message}`);

      const subjectIds = (subjectsData || []).map((s) => s.id);
      if (subjectIds.length === 0) return [];

      const { data: lecturesData, error: lError } = await supabaseAdmin
        .from("lectures")
        .select("*")
        .in("subject_id", subjectIds)
        .order("order_index", { ascending: true });
      if (lError) throw new Error(`[Curriculum.lecturesQuery] ${lError.message}`);

      return (subjectsData || []).map((subj) => ({
        ...subj,
        lectures: (lecturesData || []).filter((lect) => lect.subject_id === subj.id),
      }));
    },
    enabled: !!moduleId,
    staleTime: STALE_TIMES.curriculum,
  });

  const createSubjectMutation = useMutation({
    mutationFn: async (payload: { name: string; is_free: boolean; price_cents: number }) => {
      if (!moduleId) throw new Error("No Module selected");
      const { data, error } = await supabaseAdmin
        .from("subjects")
        .insert({ module_id: moduleId, ...normalizePricePayload(payload) })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Subject created successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects(moduleId) });
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to create subject")),
  });

  const updateSubjectMutation = useMutation({
    mutationFn: async (payload: { id: string; name: string; is_free: boolean; price_cents: number }) => {
      const { data, error } = await supabaseAdmin
        .from("subjects")
        .update(normalizePricePayload(payload))
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
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to update subject")),
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { count } = await supabaseAdmin
        .from("lectures")
        .select("id", { count: "exact", head: true })
        .eq("subject_id", id);
      if (count && count > 0) throw new Error("Cannot delete subject with associated lectures");
      const { error } = await supabaseAdmin.from("subjects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Subject deleted successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects(moduleId) });
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to delete subject")),
  });

  const reorderSubjectsMutation = useMutation({
    mutationFn: (items: { id: string; order_index: number }[]) => reorderItems("subjects", items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects(moduleId) }),
    onError: () => toast.error("Failed to update subject orders"),
  });

  return {
    subjects: subjectsQuery.data || [],
    isLoadingSubjects: subjectsQuery.isLoading,
    createSubject: createSubjectMutation.mutateAsync,
    updateSubject: updateSubjectMutation.mutateAsync,
    deleteSubject: deleteSubjectMutation.mutateAsync,
    reorderSubjects: reorderSubjectsMutation.mutateAsync,
  };
}
