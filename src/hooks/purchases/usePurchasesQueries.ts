import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { PAGE_SIZE, STALE_TIMES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { useAuthUsersFetcher } from "@/hooks/useAuthUsers";
import type { PurchaseListItem, PurchasesPageData } from "@/types/api";
import type { Module } from "@/types/database";

export function usePurchases(
  page: number,
  status: string,
  fromDate: string,
  toDate: string,
  searchSessionId: string,
) {
  const fetchAuthUsers = useAuthUsersFetcher();

  const purchasesQuery = useQuery({
    queryKey: QUERY_KEYS.purchases(page, status, fromDate, toDate, searchSessionId),
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<PurchasesPageData> => {
      try {
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const authUsers = await fetchAuthUsers("Purchases");
        const authMap = new Map(authUsers.map((u) => [u.id, u]));

        let query = supabaseAdmin
          .from("purchases")
          .select("*, modules(name)", { count: "exact" });

        if (status && status !== "all") query = query.eq("status", status);
        if (fromDate) query = query.gte("created_at", `${fromDate}T00:00:00Z`);
        if (toDate) query = query.lte("created_at", `${toDate}T23:59:59Z`);
        if (searchSessionId.trim()) query = query.ilike("payment_session_id", `%${searchSessionId}%`);

        const { data, count, error } = await query.order("created_at", { ascending: false }).range(from, to);
        if (error) throw new Error(`[Purchases.purchasesQuery] ${error.message}`);

        const purchasesWithDetails: PurchaseListItem[] = [];
        if (data?.length) {
          const userIds = Array.from(new Set(data.map((p) => p.user_id).filter(Boolean)));
          let profiles: { id: string; full_name: string | null }[] = [];
          if (userIds.length) {
            const { data: profileData, error: profileError } = await supabaseAdmin
              .from("profiles")
              .select("id, full_name")
              .in("id", userIds);
            if (profileError) throw new Error(`[Purchases.profilesQuery] ${profileError.message}`);
            profiles = profileData || [];
          }
          const profilesMap = new Map(profiles.map(p => [p.id, p]));
          data.forEach((p) => {
            const authUser = authMap.get(p.user_id);
            purchasesWithDetails.push({
              ...p,
              profiles: profilesMap.get(p.user_id) || null,
              modules: p.modules as Module | null,
              userEmail: authUser?.email || "N/A",
            });
          });
        }

        return {
          purchases: purchasesWithDetails,
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / PAGE_SIZE),
        };
      } catch (err: unknown) {
        throw new Error(getErrorMessage(err, "Failed to load transactions ledger"));
      }
    },
    staleTime: STALE_TIMES.purchases,
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
        if (error) throw new Error(`[Purchases.summaryQuery] ${error.message}`);

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
      } catch (err: unknown) {
        throw new Error(getErrorMessage(err, "Failed to fetch sales summary"));
      }
    },
    staleTime: STALE_TIMES.purchases,
  });

  return {
    summary: summaryQuery.data || { activeRevenue: 0, refundedRevenue: 0, pendingRevenue: 0 },
    isLoading: summaryQuery.isLoading,
  };
}
