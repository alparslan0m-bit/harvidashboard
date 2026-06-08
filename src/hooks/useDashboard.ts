import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "../lib/supabaseAdmin";

export interface DashboardStats {
  totalUsers: number;
  usersTrend: number;
  quizzesToday: number;
  quizzesTrend: number;
  monthlyRevenueCents: number;
  revenueTrend: number;
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
  const dashboardQuery = useQuery({
    queryKey: ["dashboard", "all-data"],
    queryFn: async () => {
      // 1. Fetch auth users (consolidated listUsers call)
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 10000,
      });
      if (userError) {
        throw new Error(`[Dashboard.listUsers] ${userError.message}`);
      }
      const allUsers = userData?.users || [];
      const totalUsers = allUsers.length;

      // 2. Quizzes taken today vs yesterday
      const todayStr = new Date().toISOString().split("T")[0];
      const { count: quizzesToday, error: quizError } = await supabaseAdmin
        .from("quiz_results")
        .select("*", { count: "exact", head: true })
        .gte("created_at", `${todayStr}T00:00:00Z`);
      if (quizError) {
        throw new Error(`[Dashboard.quizzesToday] ${quizError.message}`);
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      const { count: quizzesYesterday, error: quizYestError } = await supabaseAdmin
        .from("quiz_results")
        .select("*", { count: "exact", head: true })
        .gte("created_at", `${yesterdayStr}T00:00:00Z`)
        .lt("created_at", `${todayStr}T00:00:00Z`);
      if (quizYestError) {
        throw new Error(`[Dashboard.quizzesYesterday] ${quizYestError.message}`);
      }
      const quizzesTrend = (quizzesYesterday || 0) > 0 
        ? (((quizzesToday || 0) - quizzesYesterday) / quizzesYesterday) * 100 
        : 0;

      // 3. Monthly Revenue (current month vs last month)
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const firstDayOfLastMonth = new Date();
      firstDayOfLastMonth.setMonth(firstDayOfLastMonth.getMonth() - 1);
      firstDayOfLastMonth.setDate(1);
      firstDayOfLastMonth.setHours(0, 0, 0, 0);

      const startOfLastMonthStr = firstDayOfLastMonth.toISOString().split("T")[0] + "T00:00:00Z";

      const { data: revenueData, error: revError } = await supabaseAdmin
        .from("purchases")
        .select("amount_cents, created_at")
        .eq("status", "active")
        .gte("created_at", startOfLastMonthStr);
      if (revError) {
        throw new Error(`[Dashboard.monthlyRevenue] ${revError.message}`);
      }

      let thisMonthRevenue = 0;
      let lastMonthRevenue = 0;
      revenueData?.forEach((r) => {
        const cents = r.amount_cents || 0;
        if (new Date(r.created_at) >= firstDayOfMonth) {
          thisMonthRevenue += cents;
        } else {
          lastMonthRevenue += cents;
        }
      });
      const revenueTrend = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      // 4. Average quiz score (all time)
      const { data: scoreData, error: scoreError } = await supabaseAdmin
        .from("quiz_results")
        .select("score");
      if (scoreError) {
        throw new Error(`[Dashboard.averageQuizScore] ${scoreError.message}`);
      }
      const averageQuizScore = scoreData.length > 0
        ? scoreData.reduce((acc, row) => acc + row.score, 0) / scoreData.length
        : 0;

      // 5. Daily active users growth check
      let thisMonthUsers = 0;
      let lastMonthUsers = 0;
      allUsers.forEach((u) => {
        const joined = new Date(u.created_at);
        if (joined >= firstDayOfMonth) {
          thisMonthUsers++;
        } else if (joined >= firstDayOfLastMonth && joined < firstDayOfMonth) {
          lastMonthUsers++;
        }
      });
      const usersTrend = lastMonthUsers > 0 
        ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 
        : 0;

      // 6. Daily quizzes this week
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

      const { data: quizData, error: weeklyQuizError } = await supabaseAdmin
        .from("quiz_results")
        .select("created_at")
        .gte("created_at", start7DaysAgo.toISOString());
      if (weeklyQuizError) {
        throw new Error(`[Dashboard.dailyQuizzes] ${weeklyQuizError.message}`);
      }

      quizData.forEach((row) => {
        const dateStr = new Date(row.created_at).toISOString().split("T")[0];
        const found = past7Days.find((day: QuizDayActivity) => day.date === dateStr);
        if (found) found.quizzes++;
      });

      const dailyQuizzes = past7Days.map((day: QuizDayActivity) => {
        const dateObj = new Date(day.date);
        const label = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return { name: label, quizzes: day.quizzes };
      });

      // 7. Top 5 lectures by attempts
      const { data: statsData, error: statsError } = await supabaseAdmin
        .from("lecture_statistics")
        .select("total_attempts, lectures (name)")
        .order("total_attempts", { ascending: false })
        .limit(5);
      if (statsError) {
        throw new Error(`[Dashboard.topLectures] ${statsError.message}`);
      }

      const topLectures: TopLecture[] = (statsData || []).map((row: any) => ({
        name: row.lectures?.name || "Unknown Lecture",
        attempts: row.total_attempts || 0,
      }));

      // 8. Recent students (last 10)
      const { data: profilesData, error: profilesError } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, updated_at")
        .order("updated_at", { ascending: false });
      if (profilesError) {
        throw new Error(`[Dashboard.recentProfiles] ${profilesError.message}`);
      }

      const { data: quizScoreData, error: qScoreError } = await supabaseAdmin
        .from("quiz_results")
        .select("user_id, score");
      if (qScoreError) {
        throw new Error(`[Dashboard.quizScores] ${qScoreError.message}`);
      }

      const quizCountsMap: Record<string, { count: number; sum: number }> = {};
      quizScoreData.forEach((q: { user_id: string; score: number }) => {
        if (!quizCountsMap[q.user_id]) {
          quizCountsMap[q.user_id] = { count: 0, sum: 0 };
        }
        quizCountsMap[q.user_id].count++;
        quizCountsMap[q.user_id].sum += q.score;
      });

      const recentStudents: RecentStudent[] = [];
      const sortedUsers = [...allUsers].sort(
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

      // 9. Recent purchases (last 10)
      const { data: purchaseRows, error: purchaseError } = await supabaseAdmin
        .from("purchases")
        .select("id, user_id, amount_cents, status, created_at, module_id, subject_id, modules(name), subjects(name)")
        .order("created_at", { ascending: false })
        .limit(10);
      if (purchaseError) {
        throw new Error(`[Dashboard.recentPurchases] ${purchaseError.message}`);
      }

      const purchaseUsersMap: Record<string, string> = {};
      allUsers.forEach((u: any) => {
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
        stats: {
          totalUsers,
          usersTrend,
          quizzesToday: quizzesToday || 0,
          quizzesTrend,
          monthlyRevenueCents: thisMonthRevenue,
          revenueTrend,
          averageQuizScore: Math.round(averageQuizScore * 100) / 100,
        },
        recentData: {
          dailyQuizzes,
          topLectures,
          recentStudents,
          recentPurchases,
        },
      };
    },
    staleTime: 30 * 1000,
  });

  return {
    stats: dashboardQuery.data?.stats,
    recentData: dashboardQuery.data?.recentData,
    isLoading: dashboardQuery.isLoading,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
  };
}
