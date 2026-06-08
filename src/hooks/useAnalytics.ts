import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { QUERY_KEYS } from "../lib/queryKeys";

export interface AnalyticsData {
  dailyActiveUsers: { name: string; count: number }[];
  scoreDistribution: { range: string; count: number }[];
  topLecturesScore: { name: string; average: number }[];
  purchaseBreakdown: { name: string; value: number }[];
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
    queryFn: async ({ signal }): Promise<AnalyticsData> => {
      try {
        const startIso = `${fromDate}T00:00:00Z`;
        const endIso = `${toDate}T23:59:59Z`;

        // 1. Line chart: Daily active users
        const { data: dauData, error: dauError } = await supabaseAdmin
          .from("quiz_results")
          .select("user_id, created_at")
          .gte("created_at", startIso)
          .lte("created_at", endIso)
          .abortSignal(signal);
        if (dauError) {
          throw new Error(`[Analytics.dailyActiveUsers] ${dauError.message}`);
        }

        const dauMap: Record<string, Set<string>> = {};
        // Initialize date map
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

        // 2. Bar chart: Score distribution
        const { data: scoreData, error: scoreError } = await supabaseAdmin
          .from("quiz_results")
          .select("score")
          .gte("created_at", startIso)
          .lte("created_at", endIso)
          .abortSignal(signal);
        if (scoreError) {
          throw new Error(`[Analytics.scoreDistribution] ${scoreError.message}`);
        }

        const buckets = {
          "0-20": 0,
          "21-40": 0,
          "41-60": 0,
          "61-80": 0,
          "81-100": 0,
        };

        scoreData.forEach((row) => {
          const score = row.score;
          if (score <= 20) buckets["0-20"]++;
          else if (score <= 40) buckets["21-40"]++;
          else if (score <= 60) buckets["41-60"]++;
          else if (score <= 80) buckets["61-80"]++;
          else buckets["81-100"]++;
        });

        const scoreDistribution = Object.keys(buckets).map((range) => ({
          range,
          count: buckets[range as keyof typeof buckets],
        }));

        // 3. Horizontal bar chart: Top 10 lectures by average score
        const { data: topLectsData, error: topLectsError } = await supabaseAdmin
          .from("lecture_statistics")
          .select("average_score, lectures (name)")
          .order("average_score", { ascending: false })
          .limit(10)
          .abortSignal(signal);
        if (topLectsError) {
          throw new Error(`[Analytics.topLecturesScore] ${topLectsError.message}`);
        }

        const topLecturesScore = (topLectsData || []).map((row: any) => ({
          name: row.lectures?.name || "Unknown Lecture",
          average: parseFloat(row.average_score || "0"),
        }));

        // 4. Pie chart: Purchase status breakdown
        const { data: purchasesData, error: purError } = await supabaseAdmin
          .from("purchases")
          .select("status")
          .gte("created_at", startIso)
          .lte("created_at", endIso)
          .abortSignal(signal);
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

        // 5. Stats card counters in range
        const totalQuizzes = scoreData.length;

        // New users in period
        const { count: newUsers, error: newUsersError } = await supabaseAdmin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("updated_at", startIso)
          .lte("updated_at", endIso)
          .abortSignal(signal);
        if (newUsersError) {
          throw new Error(`[Analytics.newUsersStats] ${newUsersError.message}`);
        }

        // Total revenue in period
        const { data: revenueData, error: revError } = await supabaseAdmin
          .from("purchases")
          .select("amount_cents")
          .eq("status", "active")
          .gte("created_at", startIso)
          .lte("created_at", endIso)
          .abortSignal(signal);
        if (revError) {
          throw new Error(`[Analytics.revenueStats] ${revError.message}`);
        }

        const totalRevenueCents = revenueData.reduce((acc, row) => acc + (row.amount_cents || 0), 0);

        // Questions answered in period
        const { data: answeredData, error: ansError } = await supabaseAdmin
          .from("quiz_results")
          .select("total_questions")
          .gte("created_at", startIso)
          .lte("created_at", endIso)
          .abortSignal(signal);
        if (ansError) {
          throw new Error(`[Analytics.questionsAnsweredStats] ${ansError.message}`);
        }

        const questionsAnswered = answeredData.reduce((acc, row) => acc + (row.total_questions || 0), 0);

        return {
          dailyActiveUsers,
          scoreDistribution,
          topLecturesScore,
          purchaseBreakdown,
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
    staleTime: 30 * 1000, // analytics stats cache stale after 30s
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
