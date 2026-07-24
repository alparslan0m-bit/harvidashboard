import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { listAllAuthUsers } from "@/services/authService";
import type { DashboardData } from "@/types/dashboard";

async function fetchAdminAuditLogs(allUsers: Awaited<ReturnType<typeof listAllAuthUsers>>) {
  const { data, error } = await supabaseAdmin
    .from("admin_audit_logs")
    .select("id, admin_id, action, target_type, target_id, details, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[Dashboard.fetchAdminAuditLogs]", error);
    return [];
  }

  const authMap = new Map(allUsers.map((u) => [u.id, u]));

  return (data || []).map((log: any) => {
    const adminUser = authMap.get(log.admin_id);
    return {
      ...log,
      admin_name: adminUser?.user_metadata?.full_name || adminUser?.email || "Unknown Admin",
    };
  });
}

export async function fetchDashboardData(
  fetchAuthUsers?: (context: string) => Promise<any[]>
): Promise<DashboardData> {
  const getUsers = fetchAuthUsers ? fetchAuthUsers("Dashboard") : listAllAuthUsers("Dashboard");

  const [statsRes, allUsers] = await Promise.all([
    supabaseAdmin.rpc("get_dashboard_stats"),
    getUsers,
  ]);

  if (statsRes.error) {
    throw new Error(`[Dashboard.rpc] ${statsRes.error.message}`);
  }

  const adminAuditLogs = await fetchAdminAuditLogs(allUsers);

  return {
    stats: statsRes.data as DashboardData["stats"],
    recentData: { adminAuditLogs },
  };
}
