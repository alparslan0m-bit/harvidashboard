import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { QUERY_KEYS } from "../lib/queryKeys";

export interface DashboardStats {
  totalUsers: number;
  quizzesToday: number;
  monthlyRevenueCents: number;
  averageQuizScore: number;
}

export interface QuizDayActivity {
  date: string;
  quizzes: number;
}

export interface TopLecture {
  name: string;
  attempts: number;
}

export interface RecentStudent {
  id: string;
  email: string;
  full_name: string;
  total_quizzes: number;
  average_score: number;
  joined_date: string;
}

export interface RecentPurchase {
  id: string;
  email: string;
  itemName: string;
  amountCents: number;
  status: 'pending' | 'active' | 'failed' | 'refunded' | 'disputed';
  date: string;
}

export function useDashboard() {
  const statsQuery = useQuery({
    queryKey: QUERY_KEYS.dashboardStats,
    queryFn: async (): Promise<DashboardStats> => {
      try {
        // 1. Total registered users from auth.users
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 10000, // Safe upper limit for standard pagination count check
        });
        if (userError) throw userError;
        const totalUsers = userData?.users?.length || 0;

        // 2. Quizzes taken today
        const todayStr = new Date().toISOString().split("T")[0];
        const { count: quizzesToday, error: quizError } = await supabaseAdmin
          .from("quiz_results")
          .select("*", { count: "exact", head: true })
          .gte("created_at", `${todayStr}T00:00:00Z`);
        if (quizError) throw quizError;

        // 3. Monthly Revenue (status='active' and created_at >= first day of current month)
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        const startOfMonthStr = firstDayOfMonth.toISOString().split("T")[0] + "T00:00:00Z";

        const { data: revenueData, error: revError } = await supabaseAdmin
          .from("purchases")
          .select("amount_cents")
          .eq("status", "active")
          .gte("created_at", startOfMonthStr);
        if (revError) throw revError;

        const monthlyRevenueCents = revenueData.reduce((acc, row) => acc + (row.amount_cents || 0), 0);

        // 4. Average quiz score (all time)
        const { data: scoreData, error: scoreError } = await supabaseAdmin
          .from("quiz_results")
          .select("score");
        if (scoreError) throw scoreError;

        const averageQuizScore = scoreData.length > 0 
          ? scoreData.reduce((acc, row) => acc + row.score, 0) / scoreData.length 
          : 0;

        return {
          totalUsers,
          quizzesToday: quizzesToday || 0,
          monthlyRevenueCents,
          averageQuizScore: Math.round(averageQuizScore * 100) / 100,
        };
      } catch (err: any) {
        throw new Error(err.message || "Failed to fetch dashboard metrics");
      }
    },
  });

  const chartsQuery = useQuery({
    queryKey: QUERY_KEYS.dashboardRecentActivity,
    queryFn: async () => {
      try {
        // 1. Bar chart: Daily quizzes this week (past 7 days including today)
        const past7Days: QuizDayActivity[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          past7Days.push({ date: dateStr, quizzes: 0 });
        }

        const start7DaysAgo = new Date();
        start7DaysAgo.setDate(start7DaysAgo.getDate() - 6);
        start7DaysAgo.setHours(0, 0, 0, 0);

        const { data: quizData, error: quizError } = await supabaseAdmin
          .from("quiz_results")
          .select("created_at")
          .gte("created_at", start7DaysAgo.toISOString());
        if (quizError) throw quizError;

        quizData.forEach((row) => {
          const dateStr = new Date(row.created_at).toISOString().split("T")[0];
          const found = past7Days.find((day: QuizDayActivity) => day.date === dateStr);
          if (found) found.quizzes++;
        });

        // Format date string for the chart (e.g., "Jun 7")
        const dailyQuizzes = past7Days.map((day: QuizDayActivity) => {
          const dateObj = new Date(day.date);
          const label = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          return { name: label, quizzes: day.quizzes };
        });

        // 2. Bar chart: Top 5 lectures by attempts
        const { data: statsData, error: statsError } = await supabaseAdmin
          .from("lecture_statistics")
          .select("total_attempts, lectures (name)")
          .order("total_attempts", { ascending: false })
          .limit(5);

        if (statsError) throw statsError;

        const topLectures: TopLecture[] = (statsData || []).map((row: any) => ({
          name: row.lectures?.name || "Unknown Lecture",
          attempts: row.total_attempts || 0,
        }));

        // 3. Recent students (last 10)
        // Join profiles and get email from auth.users (since we have service role)
        const { data: profilesData, error: profilesError } = await supabaseAdmin
          .from("profiles")
          .select("id, full_name, updated_at")
          .order("updated_at", { ascending: false }); // profiles has updated_at, let's join with auth.users list
        
        if (profilesError) throw profilesError;

        const { data: authUsersData, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers({
          perPage: 100,
        });
        if (authUsersError) throw authUsersError;

        // Fetch quiz results to get count and average scores for recent users
        const { data: quizScoreData, error: qScoreError } = await supabaseAdmin
          .from("quiz_results")
          .select("user_id, score");
        if (qScoreError) throw qScoreError;

        const quizCountsMap: Record<string, { count: number; sum: number }> = {};
        quizScoreData.forEach((q: { user_id: string; score: number }) => {
          if (!quizCountsMap[q.user_id]) {
            quizCountsMap[q.user_id] = { count: 0, sum: 0 };
          }
          quizCountsMap[q.user_id].count++;
          quizCountsMap[q.user_id].sum += q.score;
        });

        // Combine
        const recentStudents: RecentStudent[] = [];
        const sortedUsers = [...(authUsersData?.users || [])].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        for (const user of sortedUsers.slice(0, 10)) {
          const profile = profilesData.find((p: any) => p.id === user.id);
          const stats = quizCountsMap[user.id] || { count: 0, sum: 0 };
          recentStudents.push({
            id: user.id,
            email: user.email || "N/A",
            full_name: profile?.full_name || "Anonymous User",
            total_quizzes: stats.count,
            average_score: stats.count > 0 ? Math.round((stats.sum / stats.count) * 100) / 100 : 0,
            joined_date: user.created_at,
          });
        }

        // 4. Recent purchases (last 10)
        const { data: purchaseRows, error: purchaseError } = await supabaseAdmin
          .from("purchases")
          .select("id, user_id, amount_cents, status, created_at, module_id, subject_id, modules(name), subjects(name)")
          .order("created_at", { ascending: false })
          .limit(10);
        if (purchaseError) throw purchaseError;

        const purchaseUsersMap: Record<string, string> = {};
        authUsersData?.users?.forEach((u: any) => {
          if (u.email) purchaseUsersMap[u.id] = u.email;
        });

        const recentPurchases: RecentPurchase[] = purchaseRows.map((row: any) => {
          const itemName = row.modules?.name || row.subjects?.name || "Subscription/Unlocking";
          return {
            id: row.id,
            email: purchaseUsersMap[row.user_id] || "N/A",
            itemName,
            amountCents: row.amount_cents,
            status: row.status,
            date: row.created_at,
          };
        });

        return {
          dailyQuizzes,
          topLectures,
          recentStudents,
          recentPurchases,
        };
      } catch (err: any) {
        throw new Error(err.message || "Failed to load dashboard data");
      }
    },
  });

  return {
    stats: statsQuery.data,
    recentData: chartsQuery.data,
    isLoading: statsQuery.isLoading || chartsQuery.isLoading,
    error: statsQuery.error || chartsQuery.error,
    refetch: () => {
      statsQuery.refetch();
      chartsQuery.refetch();
    },
  };
}
