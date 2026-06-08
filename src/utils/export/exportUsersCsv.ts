import { formatDate } from "@/lib/utils";
import { listAllAuthUsers } from "@/services/authService";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { toast } from "sonner";
import type { UserWithDetails } from "@/types/database";

interface UsersPageData {
  users?: UserWithDetails[];
}

export async function exportUsersCsv(
  currentPageOnly: boolean,
  data: UsersPageData | undefined
): Promise<void> {
  let exportProfiles: any[] = [];
  let exportAuthUsers: any[] = [];

  if (currentPageOnly) {
    if (!data?.users?.length) {
      toast.error("No users on current page to export");
      return;
    }
    exportProfiles = data.users.map((u) => ({
      id: u.id,
      full_name: u.profile?.full_name,
      user_stats: u.stats ? [u.stats] : [],
    }));
    exportAuthUsers = data.users.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
    }));
  } else {
    const { data: allProfiles, error: pError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, user_stats(*)");
    if (pError) throw pError;
    exportProfiles = allProfiles || [];

    const authUsers = await listAllAuthUsers("Users.export");
    exportAuthUsers = authUsers;
  }

  const authMap: Record<string, string> = {};
  const authCreatedMap: Record<string, string> = {};
  exportAuthUsers.forEach((u) => {
    if (u.email) authMap[u.id] = u.email;
    if (u.created_at) authCreatedMap[u.id] = u.created_at;
  });

  const csvRows = [["email", "full_name", "total_quizzes", "average_score", "joined_date"]];

  exportProfiles.forEach((p: any) => {
    const stats = p.user_stats
      ? (Array.isArray(p.user_stats) ? p.user_stats[0] : p.user_stats) || null
      : null;
    const email = authMap[p.id] || "N/A";
    const totalQuizzes = stats?.total_quizzes || 0;
    const avgScore = stats?.average_score ? `${stats.average_score}%` : "0%";
    const joinedDate = authCreatedMap[p.id] ? formatDate(authCreatedMap[p.id]) : "N/A";

    csvRows.push([
      email,
      p.full_name || "Anonymous User",
      String(totalQuizzes),
      avgScore,
      joinedDate,
    ]);
  });

  const csvContent =
    "data:text/csv;charset=utf-8," +
    csvRows
      .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
  const encodedUri = encodeURI(csvContent);

  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `harvi_users_${currentPageOnly ? "page" : "all"}_export_${Date.now()}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success("CSV file exported successfully");
}
