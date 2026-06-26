import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { listAllAuthUsers } from "@/services/authService";
import type { DashboardData } from "@/types/dashboard";

function monthBoundaries() {
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);
  const firstDayOfLastMonth = new Date();
  firstDayOfLastMonth.setMonth(firstDayOfLastMonth.getMonth() - 1);
  firstDayOfLastMonth.setDate(1);
  firstDayOfLastMonth.setHours(0, 0, 0, 0);
  return { firstDayOfMonth, firstDayOfLastMonth };
}

async function fetchQuizTrends() {
  const todayStr = new Date().toISOString().split("T")[0];
  const { count: quizzesToday, error: quizError } = await supabaseAdmin
    .from("quiz_results")
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${todayStr}T00:00:00Z`);
  if (quizError) throw new Error(`[Dashboard.quizzesToday] ${quizError.message}`);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const { count: quizzesYesterday, error: quizYestError } = await supabaseAdmin
    .from("quiz_results")
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${yesterdayStr}T00:00:00Z`)
    .lt("created_at", `${todayStr}T00:00:00Z`);
  if (quizYestError) throw new Error(`[Dashboard.quizzesYesterday] ${quizYestError.message}`);

  const yesterdayCount = quizzesYesterday ?? 0;
  return {
    quizzesToday: quizzesToday || 0,
    quizzesTrend: yesterdayCount > 0 ? (((quizzesToday || 0) - yesterdayCount) / yesterdayCount) * 100 : 0,
  };
}

async function fetchRevenueTrend() {
  const { firstDayOfMonth, firstDayOfLastMonth } = monthBoundaries();
  const startOfLastMonthStr = firstDayOfLastMonth.toISOString().split("T")[0] + "T00:00:00Z";
  const { data: revenueData, error } = await supabaseAdmin
    .from("purchases")
    .select("amount_cents, created_at")
    .eq("status", "active")
    .gte("created_at", startOfLastMonthStr);
  if (error) throw new Error(`[Dashboard.monthlyRevenue] ${error.message}`);

  let thisMonthRevenue = 0;
  let lastMonthRevenue = 0;
  revenueData?.forEach((r) => {
    const cents = r.amount_cents || 0;
    if (new Date(r.created_at) >= firstDayOfMonth) thisMonthRevenue += cents;
    else lastMonthRevenue += cents;
  });
  return {
    thisMonthRevenue,
    revenueTrend: lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0,
  };
}

async function fetchAverageScore() {
  const { data: scoreData, error } = await supabaseAdmin.from("quiz_results").select("score");
  if (error) throw new Error(`[Dashboard.averageQuizScore] ${error.message}`);
  const avg = scoreData.length > 0 ? scoreData.reduce((acc, row) => acc + row.score, 0) / scoreData.length : 0;
  return Math.round(avg * 100) / 100;
}

function computeUsersTrend(allUsers: Awaited<ReturnType<typeof listAllAuthUsers>>) {
  const { firstDayOfMonth, firstDayOfLastMonth } = monthBoundaries();
  let thisMonthUsers = 0;
  let lastMonthUsers = 0;
  allUsers.forEach((u) => {
    const joined = new Date(u.created_at);
    if (joined >= firstDayOfMonth) thisMonthUsers++;
    else if (joined >= firstDayOfLastMonth && joined < firstDayOfMonth) lastMonthUsers++;
  });
  return lastMonthUsers > 0 ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0;
}

async function fetchAdminAuditLogs(allUsers: Awaited<ReturnType<typeof listAllAuthUsers>>) {
  const { data, error } = await supabaseAdmin
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[Dashboard.fetchAdminAuditLogs]", error);
    return [];
  }

  return (data || []).map((log: any) => {
    const adminUser = allUsers.find((u) => u.id === log.admin_id);
    return {
      ...log,
      admin_name: adminUser?.user_metadata?.full_name || adminUser?.email || "Unknown Admin",
    };
  });
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const allUsers = await listAllAuthUsers("Dashboard");
  const [quizTrends, revenue, averageQuizScore, adminAuditLogs] = await Promise.all([
    fetchQuizTrends(),
    fetchRevenueTrend(),
    fetchAverageScore(),
    fetchAdminAuditLogs(allUsers),
  ]);

  return {
    stats: {
      totalUsers: allUsers.length,
      usersTrend: computeUsersTrend(allUsers),
      quizzesToday: quizTrends.quizzesToday,
      quizzesTrend: quizTrends.quizzesTrend,
      monthlyRevenueCents: revenue.thisMonthRevenue,
      revenueTrend: revenue.revenueTrend,
      averageQuizScore,
    },
    recentData: { adminAuditLogs },
  };
}
