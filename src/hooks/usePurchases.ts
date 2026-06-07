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

        // Base query joining modules, subjects
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

        const { data, count, error } = await query
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) throw error;

        // Resolve auth details (emails) and profiles for the page
        const purchasesWithDetails: any[] = [];
        if (data && data.length > 0) {
          const userIds = Array.from(new Set(data.map(p => p.user_id).filter(Boolean)));
          
          let profiles: any[] = [];
          if (userIds.length > 0) {
            const { data: profileData } = await supabaseAdmin
              .from("profiles")
              .select("id, full_name")
              .in("id", userIds);
            profiles = profileData || [];
          }

          const authUsers = await Promise.all(
            data.map(async (p) => {
              try {
                const { data: userData } = await supabaseAdmin.auth.admin.getUserById(p.user_id);
                return userData?.user || null;
              } catch {
                return null;
              }
            })
          );

          data.forEach((p, idx) => {
            const authUser = authUsers[idx];
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

        // Apply filters in sync with table
        if (fromDate) query = query.gte("created_at", `${fromDate}T00:00:00Z`);
        if (toDate) query = query.lte("created_at", `${toDate}T23:59:59Z`);
        if (searchSessionId.trim()) query = query.ilike("payment_session_id", `%${searchSessionId}%`);

        const { data, error } = await query;
        if (error) throw error;

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
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Transaction refunded successfully");
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to refund transaction");
    },
  });

  return {
    refundPurchase: refundPurchaseMutation.mutateAsync,
    isRefunding: refundPurchaseMutation.isPending,
  };
}
