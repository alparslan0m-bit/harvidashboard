import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { listAllAuthUsers, buildAuthUserEmailMap } from "@/services/authService";
import type { QuizDayActivity, TopLecture, RecentStudent, RecentPurchase } from "@/types/dashboard";

export async function fetchDailyQuizzes(): Promise<{ name: string; quizzes: number }[]> {
  const past7Days: QuizDayActivity[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    past7Days.push({ date: d.toISOString().split("T")[0], quizzes: 0 });
  }

  const start7DaysAgo = new Date();
  start7DaysAgo.setDate(start7DaysAgo.getDate() - 6);
  start7DaysAgo.setHours(0, 0, 0, 0);

  const { data: quizData, error } = await supabaseAdmin
    .from("quiz_results")
    .select("created_at")
    .gte("created_at", start7DaysAgo.toISOString());
  if (error) throw new Error(`[Dashboard.dailyQuizzes] ${error.message}`);

  quizData.forEach((row) => {
    const dateStr = new Date(row.created_at).toISOString().split("T")[0];
    const found = past7Days.find((day) => day.date === dateStr);
    if (found) found.quizzes++;
  });

  return past7Days.map((day) => ({
    name: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    quizzes: day.quizzes,
  }));
}

export async function fetchTopLectures(): Promise<TopLecture[]> {
  const { data, error } = await supabaseAdmin
    .from("lecture_statistics")
    .select("total_attempts, lectures (name)")
    .order("total_attempts", { ascending: false })
    .limit(5);
  if (error) throw new Error(`[Dashboard.topLectures] ${error.message}`);

  return (data || []).map((row) => ({
    name: (row.lectures as { name?: string } | null)?.name || "Unknown Lecture",
    attempts: row.total_attempts || 0,
  }));
}

export async function fetchRecentStudents(
  allUsers: Awaited<ReturnType<typeof listAllAuthUsers>>,
): Promise<RecentStudent[]> {
  const { data: profilesData, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, updated_at")
    .order("updated_at", { ascending: false });
  if (profilesError) throw new Error(`[Dashboard.recentProfiles] ${profilesError.message}`);

  const { data: quizScoreData, error: qScoreError } = await supabaseAdmin
    .from("quiz_results")
    .select("user_id, score");
  if (qScoreError) throw new Error(`[Dashboard.quizScores] ${qScoreError.message}`);

  const quizCountsMap: Record<string, { count: number; sum: number }> = {};
  quizScoreData.forEach((q) => {
    if (!quizCountsMap[q.user_id]) quizCountsMap[q.user_id] = { count: 0, sum: 0 };
    quizCountsMap[q.user_id].count++;
    quizCountsMap[q.user_id].sum += q.score;
  });

  const sortedUsers = [...allUsers].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return sortedUsers.slice(0, 10).map((user) => {
    const profile = profilesData.find((p) => p.id === user.id);
    const stats = quizCountsMap[user.id] || { count: 0, sum: 0 };
    return {
      id: user.id,
      email: user.email || "N/A",
      full_name: profile?.full_name || "Anonymous User",
      total_quizzes: stats.count,
      average_score: stats.count > 0 ? Math.round((stats.sum / stats.count) * 100) / 100 : 0,
      joined_date: user.created_at,
    };
  });
}

export async function fetchRecentPurchases(
  allUsers: Awaited<ReturnType<typeof listAllAuthUsers>>,
): Promise<RecentPurchase[]> {
  const { data: purchaseRows, error } = await supabaseAdmin
    .from("purchases")
    .select("id, user_id, amount_cents, status, created_at, module_id, subject_id, modules(name), subjects(name)")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw new Error(`[Dashboard.recentPurchases] ${error.message}`);

  const emailMap = buildAuthUserEmailMap(allUsers);
  return (purchaseRows || []).map((row) => {
    const modules = row.modules as { name?: string } | null;
    const subjects = row.subjects as { name?: string } | null;
    return {
      id: row.id,
      email: emailMap.get(row.user_id) || "N/A",
      itemName: modules?.name || subjects?.name || "Subscription/Unlocking",
      amountCents: row.amount_cents,
      status: row.status,
      date: row.created_at,
    };
  });
}

export async function fetchRevenueGrowth(): Promise<{ month: string; revenue: number }[]> {
  const startOf6MonthsAgo = new Date();
  startOf6MonthsAgo.setMonth(startOf6MonthsAgo.getMonth() - 5);
  startOf6MonthsAgo.setDate(1);
  startOf6MonthsAgo.setHours(0, 0, 0, 0);

  const { data: revenueData, error } = await supabaseAdmin
    .from("purchases")
    .select("amount_cents, created_at")
    .eq("status", "active")
    .gte("created_at", startOf6MonthsAgo.toISOString());
  if (error) throw new Error(`[Dashboard.revenueGrowth] ${error.message}`);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { 
      key: `${d.getFullYear()}-${d.getMonth()}`, 
      name: d.toLocaleDateString("en-US", { month: "short" }), 
      revenue: 0 
    };
  });

  revenueData?.forEach((r) => {
    const d = new Date(r.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const month = months.find((m) => m.key === key);
    if (month) {
      month.revenue += (r.amount_cents || 0) / 100;
    }
  });

  return months.map(m => ({ month: m.name, revenue: m.revenue }));
}

export function fetchUserGrowth(allUsers: Awaited<ReturnType<typeof listAllAuthUsers>>): { month: string; users: number }[] {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    d.setMonth(d.getMonth() + 1);
    d.setDate(0); 
    d.setHours(23, 59, 59, 999);
    return { 
      dateObj: d,
      name: d.toLocaleDateString("en-US", { month: "short" }), 
      users: 0 
    };
  });

  months.forEach((m) => {
    m.users = allUsers.filter(u => new Date(u.created_at).getTime() <= m.dateObj.getTime()).length;
  });

  return months.map(m => ({ month: m.name, users: m.users }));
}
