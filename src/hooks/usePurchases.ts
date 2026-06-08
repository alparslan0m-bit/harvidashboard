import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { QUERY_KEYS } from "../lib/queryKeys";
import { toast } from "sonner";

export function usePurchases(
  page: number,
  status: string,
  fromDate: string,
  toDate: string,
  searchSessionId: string
) {
  const pageSize = 25;

  const purchasesQuery = useQuery({
    queryKey: QUERY_KEYS.purchases(page, status, fromDate, toDate, searchSessionId),
    queryFn: async () => {
      try {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // 1. Get auth users list first (consolidated batch)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 10000,
        });
        if (authError) {
          throw new Error(`[Purchases.listUsers] ${authError.message}`);
        }
        const authUsers = authData?.users || [];
        const authMap = new Map<string, typeof authUsers[0]>();
        authUsers.forEach((u) => {
          authMap.set(u.id, u);
        });

        // 2. Base query joining modules, subjects
        let query = supabaseAdmin
          .from("purchases")
          .select("*, modules(name), subjects(name)", { count: "exact" });

        // Apply status filter
        if (status && status !== "all") {
          query = query.eq("status", status);
        }

        // Apply date range filter
        if (fromDate) {
          query = query.gte("created_at", `${fromDate}T00:00:00Z`);
        }
        if (toDate) {
          query = query.lte("created_at", `${toDate}T23:59:59Z`);
        }

        // Apply search by session ID
        if (searchSessionId.trim()) {
          query = query.ilike("payment_session_id", `%${searchSessionId}%`);
        }

        const { data, count, error: purchasesError } = await query
          .order("created_at", { ascending: false })
          .range(from, to);

        if (purchasesError) {
          throw new Error(`[Purchases.purchasesQuery] ${purchasesError.message}`);
        }

        const purchasesWithDetails: any[] = [];
        if (data && data.length > 0) {
          const userIds = Array.from(new Set(data.map(p => p.user_id).filter(Boolean)));
          
          let profiles: any[] = [];
          if (userIds.length > 0) {
            const { data: profileData, error: profileError } = await supabaseAdmin
              .from("profiles")
              .select("id, full_name")
              .in("id", userIds);
            if (profileError) {
              throw new Error(`[Purchases.profilesQuery] ${profileError.message}`);
            }
            profiles = profileData || [];
          }

          data.forEach((p) => {
            const authUser = authMap.get(p.user_id);
            const profile = profiles.find(pr => pr.id === p.user_id) || null;
            purchasesWithDetails.push({
              ...p,
              profiles: profile,
              modules: p.modules as any,
              subjects: p.subjects as any,
              userEmail: authUser?.email || "N/A",
              provider: p.provider,
              currency: p.currency,
              payment_id: p.payment_id,
              payment_session_id: p.payment_session_id,
              amount_cents: p.amount_cents,
              status: p.status,
              created_at: p.created_at,
              updated_at: p.updated_at,
              user_id: p.user_id,
              id: p.id,
            });
          });
        }

        return {
          purchases: purchasesWithDetails,
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        };
      } catch (err: any) {
        throw new Error(err.message || "Failed to load transactions ledger");
      }
    },
    staleTime: 10 * 1000, // purchases cache stale after 10s
  });

  return {
    data: purchasesQuery.data,
    isLoading: purchasesQuery.isLoading,
    error: purchasesQuery.error,
    refetch: purchasesQuery.refetch,
  };
}

export function usePurchasesSummary(fromDate: string, toDate: string, searchSessionId: string) {
  const summaryQuery = useQuery({
    queryKey: QUERY_KEYS.purchasesSummary(fromDate, toDate, searchSessionId),
    queryFn: async () => {
      try {
        let query = supabaseAdmin.from("purchases").select("amount_cents, status");

        if (fromDate) query = query.gte("created_at", `${fromDate}T00:00:00Z`);
        if (toDate) query = query.lte("created_at", `${toDate}T23:59:59Z`);
        if (searchSessionId.trim()) query = query.ilike("payment_session_id", `%${searchSessionId}%`);

        const { data, error } = await query;
        if (error) {
          throw new Error(`[Purchases.summaryQuery] ${error.message}`);
        }

        let activeRevenue = 0;
        let refundedRevenue = 0;
        let pendingRevenue = 0;

        (data || []).forEach((row) => {
          const cents = row.amount_cents || 0;
          if (row.status === "active") activeRevenue += cents;
          else if (row.status === "refunded") refundedRevenue += cents;
          else if (row.status === "pending") pendingRevenue += cents;
        });

        return {
          activeRevenue: activeRevenue / 100,
          refundedRevenue: refundedRevenue / 100,
          pendingRevenue: pendingRevenue / 100,
        };
      } catch (err: any) {
        throw new Error(err.message || "Failed to fetch sales summary");
      }
    },
    staleTime: 10 * 1000, // summary stale after 10s
  });

  return {
    summary: summaryQuery.data || { activeRevenue: 0, refundedRevenue: 0, pendingRevenue: 0 },
    isLoading: summaryQuery.isLoading,
  };
}

export function usePurchaseMutations() {
  const queryClient = useQueryClient();

  const refundPurchaseMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      const { data, error } = await supabaseAdmin
        .from("purchases")
        .update({ status: "refunded" })
        .eq("id", purchaseId)
        .select()
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    // Optimistic Update: Spec requirement non-negotiable
    onMutate: async (purchaseId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["purchases"] });

      // Snapshot the previous query states
      const previousQueries = queryClient.getQueriesData({ queryKey: ["purchases"] });

      // Optimistically update
      queryClient.setQueriesData({ queryKey: ["purchases"] }, (old: any) => {
        if (!old) return old;
        // Update list query
        if (old.purchases) {
          return {
            ...old,
            purchases: old.purchases.map((p: any) =>
              p.id === purchaseId ? { ...p, status: "refunded" } : p
            ),
          };
        }
        return old;
      });

      return { previousQueries };
    },
    onError: (err: any, _variables, context) => {
      // Rollback to previous values
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, value]) => {
          queryClient.setQueryData(queryKey, value);
        });
      }
      toast.error(err.message || "Failed to refund transaction");
    },
    onSuccess: () => {
      toast.success("Transaction refunded successfully");
    },
    onSettled: () => {
      // Re-sync with actual DB state
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    refundPurchase: refundPurchaseMutation.mutateAsync,
    isRefunding: refundPurchaseMutation.isPending,
  };
}
