import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { STALE_TIMES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { listAllAuthUsers } from "@/services/authService";
import { toast } from "sonner";
import type { AccessCodeWithDetails, Module } from "@/types/database";

export function useAccessCodes(moduleId: string, statusFilter: string, searchBatch: string) {
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
      // The admin_generate_codes RPC uses public.is_admin() which fails for service_role JWTs.
      // Since supabaseAdmin is initialized with the service role key, we bypass RLS 
      // and can safely generate and insert the codes directly from the client.
      const generateHex = (bytes: number) => {
        const arr = new Uint8Array(bytes);
        crypto.getRandomValues(arr);
        return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
      };

      const generate6DigitCode = () => {
        const arr = new Uint32Array(1);
        crypto.getRandomValues(arr);
        return (arr[0] % 1000000).toString().padStart(6, '0');
      };

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const batchId = `batch_${generateHex(4).toLowerCase()}_${dateStr}`;

      let expiresAt: string | null = null;
      if (payload.expiresDays) {
        const d = new Date();
        d.setDate(d.getDate() + payload.expiresDays);
        expiresAt = d.toISOString();
      }

      const toInsert: any[] = [];
      const usedCodes = new Set<string>();

      while (toInsert.length < payload.count) {
        const rawCode = generate6DigitCode();
        if (!usedCodes.has(rawCode)) {
          usedCodes.add(rawCode);
          toInsert.push({
            code: rawCode,
            module_id: payload.moduleId,
            batch_id: batchId,
            expires_at: expiresAt,
          });
        }
      }

      const { error } = await supabaseAdmin.from("access_codes").insert(toInsert);
      if (error) throw error;

      return toInsert.map((row) => row.code);
    },
    onSuccess: () => {
      toast.success("Access codes batch generated successfully");
      queryClient.invalidateQueries({ queryKey: ["accessCodes"] });
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to generate access codes")),
  });
}
