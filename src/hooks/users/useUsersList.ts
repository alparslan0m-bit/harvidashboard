import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { PAGE_SIZE, STALE_TIMES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { useAuthUsersFetcher } from "@/hooks/useAuthUsers";
import type { UserWithDetails, UserStats } from "@/types/database";

const EMPTY_ID = "00000000-0000-0000-0000-000000000000";

async function applyUserFilter(filter: string) {
  if (filter === "active_streak") {
    const { data, error } = await supabaseAdmin.from("user_stats").select("user_id").gt("current_streak", 0);
    if (error) throw new Error(`[Users.activeStreakFilter] ${error.message}`);
    const ids = (data || []).map((u) => u.user_id);
    return ids.length > 0 ? ids : [EMPTY_ID];
  }
  if (filter === "has_purchases") {
    const { data, error } = await supabaseAdmin.from("purchases").select("user_id").eq("status", "active");
    if (error) throw new Error(`[Users.hasPurchasesFilter] ${error.message}`);
    const ids = Array.from(new Set((data || []).map((u) => u.user_id)));
    return ids.length > 0 ? ids : [EMPTY_ID];
  }
  if (filter === "inactive_30_days") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split("T")[0];
    const { data, error } = await supabaseAdmin
      .from("user_stats")
      .select("user_id")
      .or(`last_quiz_date.lt.${dateStr},last_quiz_date.is.null`);
    if (error) throw new Error(`[Users.inactiveFilter] ${error.message}`);
    const ids = (data || []).map((u) => u.user_id);
    return ids.length > 0 ? ids : [EMPTY_ID];
  }
  return null;
}

export function useUsers(page: number, search: string, filter: string) {
  const fetchAuthUsers = useAuthUsersFetcher();

  const usersQuery = useQuery({
    queryKey: QUERY_KEYS.users(page, search, filter),
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      try {
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const authUsers = await fetchAuthUsers("Users");
        const authMap = new Map(authUsers.map((u) => [u.id, u]));

        let query = supabaseAdmin
          .from("profiles")
          .select("id, full_name, avatar_url, updated_at", { count: "exact" });

        const filterIds = await applyUserFilter(filter);
        if (filterIds) query = query.in("id", filterIds);

        if (search) {
          const matchingAuthIds = authUsers
            .filter((u) => u.email?.toLowerCase().includes(search.toLowerCase()))
            .map((u) => u.id);
          if (matchingAuthIds.length > 0) {
            query = query.or(`full_name.ilike.%${search}%,id.in.(${matchingAuthIds.join(",")})`);
          } else {
            query = query.ilike("full_name", `%${search}%`);
          }
        }

        const { data: profiles, count, error: profilesError } = await query
          .order("updated_at", { ascending: false })
          .range(from, to);
        if (profilesError) throw new Error(`[Users.profilesQuery] ${profilesError.message}`);

        const usersWithDetails: UserWithDetails[] = [];
        if (profiles?.length) {
          const profileIds = profiles.map((p) => p.id);
          const { data: statsData, error: statsError } = await supabaseAdmin
            .from("user_stats")
            .select("*")
            .in("user_id", profileIds);
          if (statsError) throw new Error(`[Users.statsQuery] ${statsError.message}`);

          const statsMap: Record<string, UserStats> = {};
          (statsData || []).forEach((s) => { statsMap[s.user_id] = s; });

          profiles.forEach((p) => {
            const authUser = authMap.get(p.id);
            usersWithDetails.push({
              id: p.id,
              email: authUser?.email || "N/A",
              created_at: authUser?.created_at || p.updated_at || "",
              app_metadata: authUser?.app_metadata || {},
              profile: { id: p.id, full_name: p.full_name, avatar_url: p.avatar_url, updated_at: p.updated_at },
              stats: statsMap[p.id] || null,
            });
          });
        }

        return {
          users: usersWithDetails,
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / PAGE_SIZE),
        };
      } catch (err: unknown) {
        throw new Error(getErrorMessage(err, "Failed to fetch users"));
      }
    },
    staleTime: STALE_TIMES.users,
  });

  return {
    data: usersQuery.data,
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    refetch: usersQuery.refetch,
  };
}
