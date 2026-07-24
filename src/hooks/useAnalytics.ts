import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { QUERY_KEYS } from "../lib/queryKeys";
import {
  fetchDailyQuizzes,
  fetchRevenueGrowth,
  fetchUserGrowth,
} from "@/services/dashboardRecentService";
import { useAuthUsersFetcher } from "@/hooks/useAuthUsers";

export interface AnalyticsData {
  dailyActiveUsers: { name: string; count: number }[];
  purchaseBreakdown: { name: string; value: number }[];
  dailyQuizzes: { name: string; quizzes: number }[];
  userGrowth: { month: string; users: number }[];
  revenue: { month: string; revenue: number }[];
  stats: {
    totalQuizzes: number;
    newUsers: number;
    totalRevenueCents: number;
    questionsAnswered: number;
  };
}

export function useAnalytics(fromDate: string, toDate: string) {
  const fetchAuthUsers = useAuthUsersFetcher();

  const query = useQuery({
    queryKey: [...QUERY_KEYS.analytics(30), fromDate, toDate],
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<AnalyticsData> => {
      try {
        const startIso = `${fromDate}T00:00:00Z`;
        const endIso = `${toDate}T23:59:59Z`;

        // Single combined quiz_results fetch — covers DAU, score, and questions answered
        const quizResultsPromise = supabaseAdmin
          .from("quiz_results")
          .select("user_id, created_at, score, total_questions")
          .gte("created_at", startIso)
          .lte("created_at", endIso)
          .limit(50000);

        const purchasesPromise = supabaseAdmin
          .from("purchases")
          .select("status, amount_cents, created_at")
          .gte("created_at", startIso)
          .lte("created_at", endIso)
          .limit(50000);

        const newUsersPromise = supabaseAdmin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("updated_at", startIso)
          .lte("updated_at", endIso);

        // All independent — fire in parallel
        const [
          { data: quizData, error: quizError },
          { data: purchasesData, error: purError },
          { count: newUsers, error: newUsersError },
          allUsers,
          dailyQuizzes,
          revenue,
        ] = await Promise.all([
          quizResultsPromise,
          purchasesPromise,
          newUsersPromise,
          fetchAuthUsers("Analytics"),
          fetchDailyQuizzes(fromDate, toDate),
          fetchRevenueGrowth(fromDate, toDate),
        ]);

        if (quizError) throw new Error(`[Analytics.quizResults] ${quizError.message}`);
        if (purError) throw new Error(`[Analytics.purchases] ${purError.message}`);
        if (newUsersError) throw new Error(`[Analytics.newUsers] ${newUsersError.message}`);

        // --- Daily Active Users ---
        const dauMap: Record<string, Set<string>> = {};
        const start = new Date(fromDate);
        const end = new Date(toDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dauMap[d.toISOString().split("T")[0]] = new Set();
        }
        (quizData ?? []).forEach((row) => {
          const dateStr = new Date(row.created_at).toISOString().split("T")[0];
          if (dauMap[dateStr]) dauMap[dateStr].add(row.user_id);
        });
        const dailyActiveUsers = Object.keys(dauMap).map((date) => ({
          name: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          count: dauMap[date].size,
        }));

        // --- Purchase Breakdown ---
        const statusMap: Record<string, number> = {};
        (purchasesData ?? []).forEach((row) => {
          const status = row.status || "pending";
          statusMap[status] = (statusMap[status] || 0) + 1;
        });
        const purchaseBreakdown = Object.keys(statusMap).map((status) => ({
          name: status.toUpperCase(),
          value: statusMap[status],
        }));

        // --- Stats (derived from already-fetched data) ---
        const totalQuizzes = (quizData ?? []).length;
        const totalRevenueCents = (purchasesData ?? [])
          .filter((r) => r.status === "active")
          .reduce((acc, row) => acc + (row.amount_cents || 0), 0);
        const questionsAnswered = (quizData ?? []).reduce(
          (acc, row) => acc + (row.total_questions || 0),
          0,
        );

        const userGrowth = fetchUserGrowth(allUsers, fromDate, toDate);

        return {
          dailyActiveUsers,
          purchaseBreakdown,
          dailyQuizzes,
          userGrowth,
          revenue,
          stats: {
            totalQuizzes,
            newUsers: newUsers || 0,
            totalRevenueCents,
            questionsAnswered,
          },
        };
      } catch (err: any) {
        throw new Error(err.message || "Failed to load system analytics");
      }
    },
    enabled: !!fromDate && !!toDate,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
