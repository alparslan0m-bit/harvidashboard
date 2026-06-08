import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { STALE_TIMES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import type { ModuleWithCount } from "@/types/curriculum";
import { normalizePricePayload, reorderItems } from "./reorderItems";

export function useModules(yearId: string | null) {
  const queryClient = useQueryClient();

  const modulesQuery = useQuery({
    queryKey: QUERY_KEYS.modules(yearId),
    queryFn: async (): Promise<ModuleWithCount[]> => {
      if (!yearId) return [];
      const { data, error } = await supabaseAdmin
        .from("modules")
        .select("*, subjects(id)")
        .eq("year_id", yearId)
        .order("order_index", { ascending: true });
      if (error) throw new Error(`[Curriculum.modulesQuery] ${error.message}`);
      return (data || []).map((row) => ({
        ...row,
        subjectsCount: (row.subjects as { id: string }[] | null)?.length ?? 0,
      })) as ModuleWithCount[];
    },
    enabled: !!yearId,
    staleTime: STALE_TIMES.curriculum,
  });

  const createModuleMutation = useMutation({
    mutationFn: async (payload: { name: string; is_free: boolean; price_cents: number }) => {
      if (!yearId) throw new Error("No Year selected");
      const { data, error } = await supabaseAdmin
        .from("modules")
        .insert({ year_id: yearId, ...normalizePricePayload(payload) })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Module created successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modules(yearId) });
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to create module")),
  });

  const updateModuleMutation = useMutation({
    mutationFn: async (payload: { id: string; name: string; is_free: boolean; price_cents: number }) => {
      const { data, error } = await supabaseAdmin
        .from("modules")
        .update(normalizePricePayload(payload))
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
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to update module")),
  });

  const deleteModuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { count } = await supabaseAdmin
        .from("subjects")
        .select("id", { count: "exact", head: true })
        .eq("module_id", id);
      if (count && count > 0) throw new Error("Cannot delete module with associated subjects");
      const { error } = await supabaseAdmin.from("modules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Module deleted successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modules(yearId) });
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to delete module")),
  });

  const reorderModulesMutation = useMutation({
    mutationFn: (items: { id: string; order_index: number }[]) => reorderItems("modules", items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modules(yearId) }),
    onError: () => toast.error("Failed to update module orders"),
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
