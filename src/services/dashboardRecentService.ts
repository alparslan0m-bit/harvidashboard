import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { listAllAuthUsers } from "@/services/authService";

interface QuizDayActivity {
  date: string;
  quizzes: number;
}

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
      revenue: 0,
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

  return months.map((m) => ({ month: m.name, revenue: m.revenue }));
}

export function fetchUserGrowth(
  allUsers: Awaited<ReturnType<typeof listAllAuthUsers>>,
): { month: string; users: number }[] {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return {
      dateObj: d,
      name: d.toLocaleDateString("en-US", { month: "short" }),
      users: 0,
    };
  });

  months.forEach((m) => {
    m.users = allUsers.filter((u) => new Date(u.created_at).getTime() <= m.dateObj.getTime()).length;
  });

  return months.map((m) => ({ month: m.name, users: m.users }));
}
