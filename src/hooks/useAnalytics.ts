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
    queryFn: async (): Promise<AnalyticsData> => {
      try {
        const startIso = `${fromDate}T00:00:00Z`;
        const endIso = `${toDate}T23:59:59Z`;

        // 1. Line chart: Daily active users (distinct user_id in quiz_results grouped by Date)
        const { data: dauData, error: dauError } = await supabaseAdmin
          .from("quiz_results")
          .select("user_id, created_at")
          .gte("created_at", startIso)
          .lte("created_at", endIso);
        if (dauError) throw dauError;

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

        // 2. Bar chart: Score distribution (0-20, 21-40, 41-60, 61-80, 81-100)
        const { data: scoreData, error: scoreError } = await supabaseAdmin
          .from("quiz_results")
          .select("score")
          .gte("created_at", startIso)
          .lte("created_at", endIso);
        if (scoreError) throw scoreError;

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
          .limit(10);
        if (topLectsError) throw topLectsError;

        const topLecturesScore = (topLectsData || []).map((row: any) => ({
          name: row.lectures?.name || "Unknown Lecture",
          average: parseFloat(row.average_score || "0"),
        }));

        // 4. Pie chart: Purchase status breakdown (count purchases grouped by status)
        const { data: purchasesData, error: purError } = await supabaseAdmin
          .from("purchases")
          .select("status")
          .gte("created_at", startIso)
          .lte("created_at", endIso);
        if (purError) throw purError;

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
        // Total quizzes in period
        const totalQuizzes = scoreData.length;

        // New users in period (count profiles created in date range)
        const { count: newUsers, error: newUsersError } = await supabaseAdmin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("updated_at", startIso) // Sync profiles date boundary
          .lte("updated_at", endIso);
        if (newUsersError) throw newUsersError;

        // Total revenue in period (sum amount_cents for active status)
        const { data: revenueData, error: revError } = await supabaseAdmin
          .from("purchases")
          .select("amount_cents")
          .eq("status", "active")
          .gte("created_at", startIso)
          .lte("created_at", endIso);
        if (revError) throw revError;

        const totalRevenueCents = revenueData.reduce((acc, row) => acc + (row.amount_cents || 0), 0);

        // Questions answered in period (sum total_questions of quiz_results)
        const { data: answeredData, error: ansError } = await supabaseAdmin
          .from("quiz_results")
          .select("total_questions")
          .gte("created_at", startIso)
          .lte("created_at", endIso);
        if (ansError) throw ansError;

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
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
