import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { QUERY_KEYS } from "../lib/queryKeys";
import { listAllAuthUsers } from "@/services/authService";
import {
  fetchDailyQuizzes,
  fetchRevenueGrowth,
  fetchUserGrowth,
} from "@/services/dashboardRecentService";

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
  const query = useQuery({
    queryKey: [...QUERY_KEYS.analytics(30), fromDate, toDate],
    queryFn: async (): Promise<AnalyticsData> => {
      try {
        const startIso = `${fromDate}T00:00:00Z`;
        const endIso = `${toDate}T23:59:59Z`;

        const { data: dauData, error: dauError } = await supabaseAdmin
          .from("quiz_results")
          .select("user_id, created_at")
          .gte("created_at", startIso)
          .lte("created_at", endIso)
          .limit(50000);
        if (dauError) {
          throw new Error(`[Analytics.dailyActiveUsers] ${dauError.message}`);
        }

        const dauMap: Record<string, Set<string>> = {};
        const start = new Date(fromDate);
        const end = new Date(toDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split("T")[0];
          dauMap[dateStr] = new Set();
        }

        dauData.forEach((row) => {
          const dateStr = new Date(row.created_at).toISOString().split("T")[0];
          if (dauMap[dateStr]) {
            dauMap[dateStr].add(row.user_id);
          }
        });

        const dailyActiveUsers = Object.keys(dauMap).map((date) => {
          const dObj = new Date(date);
          const label = dObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          return {
            name: label,
            count: dauMap[date].size,
          };
        });

        const { data: scoreData, error: scoreError } = await supabaseAdmin
          .from("quiz_results")
          .select("score")
          .gte("created_at", startIso)
          .lte("created_at", endIso)
          .limit(50000);
        if (scoreError) {
          throw new Error(`[Analytics.scoreData] ${scoreError.message}`);
        }

        const { data: purchasesData, error: purError } = await supabaseAdmin
          .from("purchases")
          .select("status")
          .gte("created_at", startIso)
          .lte("created_at", endIso)
          .limit(50000);
        if (purError) {
          throw new Error(`[Analytics.purchaseBreakdown] ${purError.message}`);
        }

        const statusMap: Record<string, number> = {};
        purchasesData.forEach((row) => {
          const status = row.status || "pending";
          statusMap[status] = (statusMap[status] || 0) + 1;
        });

        const purchaseBreakdown = Object.keys(statusMap).map((status) => ({
          name: status.toUpperCase(),
          value: statusMap[status],
        }));

        const totalQuizzes = scoreData.length;

        const { count: newUsers, error: newUsersError } = await supabaseAdmin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("updated_at", startIso)
          .lte("updated_at", endIso);
        if (newUsersError) {
          throw new Error(`[Analytics.newUsersStats] ${newUsersError.message}`);
        }

        const { data: revenueData, error: revError } = await supabaseAdmin
          .from("purchases")
          .select("amount_cents")
          .eq("status", "active")
          .gte("created_at", startIso)
          .lte("created_at", endIso)
          .limit(50000);
        if (revError) {
          throw new Error(`[Analytics.revenueStats] ${revError.message}`);
        }

        const totalRevenueCents = revenueData.reduce((acc, row) => acc + (row.amount_cents || 0), 0);

        const { data: answeredData, error: ansError } = await supabaseAdmin
          .from("quiz_results")
          .select("total_questions")
          .gte("created_at", startIso)
          .lte("created_at", endIso)
          .limit(50000);
        if (ansError) {
          throw new Error(`[Analytics.questionsAnsweredStats] ${ansError.message}`);
        }

        const questionsAnswered = answeredData.reduce((acc, row) => acc + (row.total_questions || 0), 0);

        const allUsers = await listAllAuthUsers("Analytics");
        const [dailyQuizzes, revenue] = await Promise.all([
          fetchDailyQuizzes(fromDate, toDate),
          fetchRevenueGrowth(fromDate, toDate),
        ]);
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
    staleTime: 30 * 1000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
