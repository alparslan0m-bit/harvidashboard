import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { STALE_TIMES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { listAllAuthUsers } from "@/services/authService";
import { toast } from "sonner";
import type { AccessCodeWithDetails, Module } from "@/types/database";

export function useAccessCodes(moduleId: string, statusFilter: string, searchBatch: string) {
  const queryClient = useQueryClient();

  const accessCodesQuery = useQuery({
    queryKey: QUERY_KEYS.accessCodes(moduleId, statusFilter, searchBatch),
    queryFn: async (): Promise<AccessCodeWithDetails[]> => {
      try {
        const authUsers = await listAllAuthUsers("AccessCodes");
        const authMap = new Map(authUsers.map((u) => [u.id, u.email]));

        let query = supabaseAdmin
          .from("access_codes")
          .select("*, modules(id, name)");

        if (moduleId && moduleId !== "all") {
          query = query.eq("module_id", moduleId);
        }

        if (statusFilter === "redeemed") {
          query = query.not("redeemed_by", "is", null);
        } else if (statusFilter === "unredeemed") {
          query = query.is("redeemed_by", null);
        }

        if (searchBatch.trim()) {
          query = query.ilike("batch_id", `%${searchBatch.trim()}%`);
        }

        const { data, error } = await query.order("created_at", { ascending: false }).limit(500);

        if (error) throw new Error(`[AccessCodes.query] ${error.message}`);

        return (data || []).map((row) => ({
          ...row,
          modules: row.modules as Module | null,
          redeemer_email: row.redeemed_by ? authMap.get(row.redeemed_by) || "Unknown User" : null,
        }));
      } catch (err: unknown) {
        throw new Error(getErrorMessage(err, "Failed to load access codes"));
      }
    },
    staleTime: STALE_TIMES.purchases,
  });

  return {
    accessCodes: accessCodesQuery.data || [],
    isLoading: accessCodesQuery.isLoading,
    error: accessCodesQuery.error,
    refetch: () => accessCodesQuery.refetch(),
  };
}

export function useGenerateAccessCodes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      moduleId: string;
      count: number;
      expiresDays?: number | null;
    }) => {
      const { data, error } = await supabaseAdmin.rpc("admin_generate_codes", {
        p_target_id: payload.moduleId,
        p_count: payload.count,
        p_expires_days: payload.expiresDays ?? null,
      });

      if (error) throw error;
      return (data || []) as { code: string }[] | string[];
    },
    onSuccess: () => {
      toast.success("Access codes batch generated successfully");
      queryClient.invalidateQueries({ queryKey: ["accessCodes"] });
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to generate access codes")),
  });
}
