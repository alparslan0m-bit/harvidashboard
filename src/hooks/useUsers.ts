import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { QUERY_KEYS } from "../lib/queryKeys";
import { toast } from "sonner";
import type { UserWithDetails, QuizResultWithLecture, PurchaseWithDetails } from "../types/database";

export function useUsers(page: number, search: string, filter: string) {
  const pageSize = 25;

  const usersQuery = useQuery({
    queryKey: QUERY_KEYS.users(page, search, filter),
    queryFn: async () => {
      try {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Base query for profiles & user_stats
        let query = supabaseAdmin
          .from("profiles")
          .select("id, full_name, avatar_url, updated_at", { count: "exact" });

        // Apply filters
        if (filter === "active_streak") {
          // active streak is streak > 0
          const { data: streakUsers } = await supabaseAdmin
            .from("user_stats")
            .select("user_id")
            .gt("current_streak", 0);
          const ids = (streakUsers || []).map((u: any) => u.user_id);
          query = query.in("id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);
        } else if (filter === "has_purchases") {
          // purchases count > 0
          const { data: purchasedUsers } = await supabaseAdmin
            .from("purchases")
            .select("user_id")
            .eq("status", "active");
          const ids = Array.from(new Set((purchasedUsers || []).map((u: any) => u.user_id)));
          query = query.in("id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);
        } else if (filter === "inactive_30_days") {
          // no quiz in 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const dateStr = thirtyDaysAgo.toISOString().split("T")[0];
          
          const { data: inactiveUsers } = await supabaseAdmin
            .from("user_stats")
            .select("user_id")
            .or(`last_quiz_date.lt.${dateStr},last_quiz_date.is.null`);
          
          const ids = (inactiveUsers || []).map((u: any) => u.user_id);
          query = query.in("id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);
        }

        // Apply search by full name
        if (search) {
          // Search full_name or match by email
          // Since email is in auth.users, we can first query auth users matching the search email
          const { data: authSearchData } = await supabaseAdmin.auth.admin.listUsers({
            perPage: 100,
          });
          const matchingAuthIds = (authSearchData?.users || [])
            .filter((u: any) => u.email?.toLowerCase().includes(search.toLowerCase()))
            .map((u: any) => u.id);

          if (matchingAuthIds.length > 0) {
            query = query.or(`full_name.ilike.%${search}%,id.in.(${matchingAuthIds.join(",")})`);
          } else {
            query = query.ilike("full_name", `%${search}%`);
          }
        }

        const { data: profiles, count, error } = await query
          .order("updated_at", { ascending: false })
          .range(from, to);

        if (error) throw error;

        // Resolve auth details (emails & created_at) and user_stats
        const usersWithDetails: UserWithDetails[] = [];
        if (profiles && profiles.length > 0) {
          const profileIds = profiles.map((p: any) => p.id);

          // Fetch user stats
          const { data: statsData } = await supabaseAdmin
            .from("user_stats")
            .select("*")
            .in("user_id", profileIds);

          const statsMap: Record<string, any> = {};
          (statsData || []).forEach((s: any) => {
            statsMap[s.user_id] = s;
          });

          const authUsers = await Promise.all(
            profiles.map(async (p: any) => {
              try {
                const { data } = await supabaseAdmin.auth.admin.getUserById(p.id);
                return data?.user || null;
              } catch {
                return null;
              }
            })
          );

          profiles.forEach((p, idx) => {
            const authUser = authUsers[idx];
            usersWithDetails.push({
              id: p.id,
              email: authUser?.email || "N/A",
              created_at: authUser?.created_at || p.updated_at || "",
              profile: {
                id: p.id,
                full_name: p.full_name,
                avatar_url: p.avatar_url,
                updated_at: p.updated_at,
              },
              stats: statsMap[p.id] || null,
            });
          });
        }

        return {
          users: usersWithDetails,
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        };
      } catch (err: any) {
        throw new Error(err.message || "Failed to fetch users");
      }
    },
  });

  return {
    data: usersQuery.data,
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    refetch: usersQuery.refetch,
  };
}

export function useUserDetail(userId: string | null) {
  const userDetailQuery = useQuery({
    queryKey: QUERY_KEYS.userDetail(userId || ""),
    queryFn: async (): Promise<UserWithDetails | null> => {
      if (!userId) return null;
      
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, avatar_url, updated_at")
        .eq("id", userId)
        .single();

      let stats = null;
      if (profile) {
        const { data: statsData } = await supabaseAdmin
          .from("user_stats")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        stats = statsData;
      }

      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId);
      const authUser = authData?.user;

      if (!profile && !authUser) return null;

      return {
        id: userId,
        email: authUser?.email || "N/A",
        created_at: authUser?.created_at || "",
        profile: profile
          ? {
              id: profile.id,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
              updated_at: profile.updated_at,
            }
          : null,
        stats: stats,
      };
    },
    enabled: !!userId,
  });

  const quizHistoryQuery = useQuery({
    queryKey: QUERY_KEYS.userQuizHistory(userId || ""),
    queryFn: async (): Promise<QuizResultWithLecture[]> => {
      if (!userId) return [];
      const { data, error } = await supabaseAdmin
        .from("quiz_results")
        .select("id, user_id, lecture_id, score, total_questions, correct_answers, created_at, lectures(name)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        lecture_id: row.lecture_id,
        score: row.score,
        total_questions: row.total_questions,
        correct_answers: row.correct_answers,
        created_at: row.created_at,
        lectures: row.lectures,
      }));
    },
    enabled: !!userId,
  });

  const purchasesQuery = useQuery({
    queryKey: QUERY_KEYS.userPurchases(userId || ""),
    queryFn: async (): Promise<PurchaseWithDetails[]> => {
      if (!userId) return [];
      const { data, error } = await supabaseAdmin
        .from("purchases")
        .select("id, user_id, status, amount_cents, currency, created_at, module_id, subject_id, modules(name), subjects(name)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        module_id: row.module_id,
        subject_id: row.subject_id,
        status: row.status,
        amount_cents: row.amount_cents,
        currency: row.currency,
        payment_id: row.payment_id,
        payment_session_id: row.payment_session_id,
        provider: row.provider,
        created_at: row.created_at,
        updated_at: row.updated_at,
        modules: row.modules,
        subjects: row.subjects,
      }));
    },
    enabled: !!userId,
  });

  return {
    user: userDetailQuery.data,
    quizHistory: quizHistoryQuery.data || [],
    purchases: purchasesQuery.data || [],
    isLoading: userDetailQuery.isLoading || quizHistoryQuery.isLoading || purchasesQuery.isLoading,
  };
}

export function useUserMutations() {
  const queryClient = useQueryClient();

  const grantAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        app_metadata: { role: "admin" },
        user_metadata: { role: "admin" }, // Sync both places
      });

      if (error) throw error;
      return data.user;
    },
    onSuccess: (_, userId) => {
      toast.success("Admin role granted successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userDetail(userId) });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to grant admin role");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete user");
    },
  });

  return {
    grantAdmin: grantAdminMutation.mutateAsync,
    isGranting: grantAdminMutation.isPending,
    deleteUser: deleteUserMutation.mutateAsync,
    isDeleting: deleteUserMutation.isPending,
  };
}
