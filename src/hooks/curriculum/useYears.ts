import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { STALE_TIMES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import type { YearWithCount } from "@/types/curriculum";
import { reorderItems } from "./reorderItems";

export function useYears() {
  const queryClient = useQueryClient();

  const yearsQuery = useQuery({
    queryKey: QUERY_KEYS.years,
    queryFn: async (): Promise<YearWithCount[]> => {
      const { data, error } = await supabaseAdmin
        .from("years")
        .select("*, modules(id)")
        .order("name", { ascending: true });

      if (error) throw new Error(`[Curriculum.yearsQuery] ${error.message}`);

      const sorted = (data || []).map((row) => ({
        ...row,
        order_index: row.order_index ?? 0,
        modulesCount: (row.modules as { id: string }[] | null)?.length ?? 0,
      })) as YearWithCount[];

      return sorted.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    },
    staleTime: STALE_TIMES.curriculum,
  });

  const createYearMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabaseAdmin.from("years").insert({ name }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Academic year created");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.years });
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to create year")),
  });

  const updateYearMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabaseAdmin.from("years").update({ name }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Academic year updated");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.years });
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to update year")),
  });

  const deleteYearMutation = useMutation({
    mutationFn: async (id: string) => {
      const { count } = await supabaseAdmin
        .from("modules")
        .select("id", { count: "exact", head: true })
        .eq("year_id", id);
      if (count && count > 0) throw new Error("Cannot delete year with associated modules");
      const { error } = await supabaseAdmin.from("years").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Academic year deleted");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.years });
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to delete year")),
  });

  const reorderYearsMutation = useMutation({
    mutationFn: (items: { id: string; order_index: number }[]) => reorderItems("years", items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.years }),
    onError: () => toast.error("Failed to update year orders"),
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

/** @deprecated Use useYears — kept for backward compatibility */
export const useCurriculum = useYears;
