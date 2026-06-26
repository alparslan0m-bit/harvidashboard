import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { listAllAuthUsers } from "@/services/authService";

interface QuizDayActivity {
  date: string;
  quizzes: number;
}

/**
 * Fetches daily quiz counts. When fromDate/toDate are provided, scopes
 * the query to that range and generates a bucket per day. Falls back to
 * the last 7 days when omitted (Dashboard compatibility).
 */
export async function fetchDailyQuizzes(
  fromDate?: string,
  toDate?: string,
): Promise<{ name: string; quizzes: number }[]> {
  const hasRange = fromDate && toDate;

  const startDate = hasRange ? new Date(fromDate) : (() => { const d = new Date(); d.setDate(d.getDate() - 6); return d; })();
  const endDate = hasRange ? new Date(toDate) : new Date();
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  // Build day buckets
  const days: QuizDayActivity[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push({ date: d.toISOString().split("T")[0], quizzes: 0 });
  }

  const { data: quizData, error } = await supabaseAdmin
    .from("quiz_results")
    .select("created_at")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());
  if (error) throw new Error(`[Dashboard.dailyQuizzes] ${error.message}`);

  quizData.forEach((row) => {
    const dateStr = new Date(row.created_at).toISOString().split("T")[0];
    const found = days.find((day) => day.date === dateStr);
    if (found) found.quizzes++;
  });

  return days.map((day) => ({
    name: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    quizzes: day.quizzes,
  }));
}

/**
 * Fetches monthly revenue. When fromDate/toDate are provided, scopes
 * the query and month buckets to that range. Falls back to the last
 * 6 months when omitted.
 */
export async function fetchRevenueGrowth(
  fromDate?: string,
  toDate?: string,
): Promise<{ month: string; revenue: number }[]> {
  const hasRange = fromDate && toDate;

  const startOf = hasRange
    ? (() => { const d = new Date(fromDate); d.setDate(1); d.setHours(0, 0, 0, 0); return d; })()
    : (() => { const d = new Date(); d.setMonth(d.getMonth() - 5); d.setDate(1); d.setHours(0, 0, 0, 0); return d; })();
  const endOf = hasRange ? new Date(toDate) : new Date();
  endOf.setHours(23, 59, 59, 999);

  const { data: revenueData, error } = await supabaseAdmin
    .from("purchases")
    .select("amount_cents, created_at")
    .eq("status", "active")
    .gte("created_at", startOf.toISOString())
    .lte("created_at", endOf.toISOString());
  if (error) throw new Error(`[Dashboard.revenueGrowth] ${error.message}`);

  // Build month buckets spanning the range
  const months: { key: string; name: string; revenue: number }[] = [];
  const cursor = new Date(startOf);
  while (cursor <= endOf) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
    if (!months.find((m) => m.key === key)) {
      months.push({
        key,
        name: cursor.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        revenue: 0,
      });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

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

/**
 * Computes cumulative user growth by month. When fromDate/toDate are
 * provided, scopes the month buckets to that range. Falls back to the
 * last 6 months when omitted.
 */
export function fetchUserGrowth(
  allUsers: Awaited<ReturnType<typeof listAllAuthUsers>>,
  fromDate?: string,
  toDate?: string,
): { month: string; users: number }[] {
  const hasRange = fromDate && toDate;

  const startOf = hasRange
    ? (() => { const d = new Date(fromDate); d.setDate(1); return d; })()
    : (() => { const d = new Date(); d.setMonth(d.getMonth() - 5); d.setDate(1); return d; })();
  const endOf = hasRange ? new Date(toDate) : new Date();

  // Build month-end buckets spanning the range
  const months: { dateObj: Date; name: string; users: number }[] = [];
  const cursor = new Date(startOf);
  while (cursor <= endOf) {
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999);
    months.push({
      dateObj: monthEnd,
      name: monthEnd.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      users: 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  months.forEach((m) => {
    m.users = allUsers.filter((u) => new Date(u.created_at).getTime() <= m.dateObj.getTime()).length;
  });

  return months.map((m) => ({ month: m.name, users: m.users }));
}
