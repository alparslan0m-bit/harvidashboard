import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import { reorderItems } from "./reorderItems";

export function useLectureMutations(moduleId: string | null) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects(moduleId) });

  const createLectureMutation = useMutation({
    mutationFn: async (payload: { subjectId: string; name: string; is_free?: boolean }) => {
      const { data, error } = await supabaseAdmin
        .from("lectures")
        .insert({
          subject_id: payload.subjectId,
          name: payload.name,
          is_free: payload.is_free ?? false,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Lecture created successfully");
      invalidate();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to create lecture")),
  });

  const updateLectureMutation = useMutation({
    mutationFn: async (payload: { id: string; name?: string; is_free?: boolean }) => {
      const updateData: Record<string, unknown> = {};
      if (payload.name !== undefined) updateData.name = payload.name;
      if (payload.is_free !== undefined) updateData.is_free = payload.is_free;

      const { data, error } = await supabaseAdmin
        .from("lectures")
        .update(updateData)
        .eq("id", payload.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Lecture updated successfully");
      invalidate();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to update lecture")),
  });

  const deleteLectureMutation = useMutation({
    mutationFn: async (id: string) => {
      const { count } = await supabaseAdmin
        .from("questions")
        .select("id", { count: "exact", head: true })
        .eq("lecture_id", id);
      if (count && count > 0) throw new Error("Cannot delete lecture with associated questions");
      const { error } = await supabaseAdmin.from("lectures").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lecture deleted successfully");
      invalidate();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to delete lecture")),
  });

  const reorderLecturesMutation = useMutation({
    mutationFn: (items: { id: string; order_index: number }[]) => reorderItems("lectures", items),
    onSuccess: invalidate,
    onError: () => toast.error("Failed to update lecture orders"),
  });

  return {
    createLecture: createLectureMutation.mutateAsync,
    updateLecture: updateLectureMutation.mutateAsync,
    deleteLecture: deleteLectureMutation.mutateAsync,
    reorderLectures: reorderLecturesMutation.mutateAsync,
  };
}
