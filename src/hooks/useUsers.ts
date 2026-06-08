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

        // 1. Get auth users list first (consolidated batch)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 10000,
        });
        if (authError) {
          throw new Error(`[Users.listUsers] ${authError.message}`);
        }
        const authUsers = authData?.users || [];
        const authMap = new Map<string, typeof authUsers[0]>();
        authUsers.forEach((u) => {
          authMap.set(u.id, u);
        });

        // 2. Base query for profiles
        let query = supabaseAdmin
          .from("profiles")
          .select("id, full_name, avatar_url, updated_at", { count: "exact" });

        // Apply filters
        if (filter === "active_streak") {
          const { data: streakUsers, error: streakError } = await supabaseAdmin
            .from("user_stats")
            .select("user_id")
            .gt("current_streak", 0);
          if (streakError) {
            throw new Error(`[Users.activeStreakFilter] ${streakError.message}`);
          }
          const ids = (streakUsers || []).map((u: any) => u.user_id);
          query = query.in("id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);
        } else if (filter === "has_purchases") {
          const { data: purchasedUsers, error: purchaseFilterError } = await supabaseAdmin
            .from("purchases")
            .select("user_id")
            .eq("status", "active");
          if (purchaseFilterError) {
            throw new Error(`[Users.hasPurchasesFilter] ${purchaseFilterError.message}`);
          }
          const ids = Array.from(new Set((purchasedUsers || []).map((u: any) => u.user_id)));
          query = query.in("id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);
        } else if (filter === "inactive_30_days") {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const dateStr = thirtyDaysAgo.toISOString().split("T")[0];
          
          const { data: inactiveUsers, error: inactiveError } = await supabaseAdmin
            .from("user_stats")
            .select("user_id")
            .or(`last_quiz_date.lt.${dateStr},last_quiz_date.is.null`);
          if (inactiveError) {
            throw new Error(`[Users.inactiveFilter] ${inactiveError.message}`);
          }
          
          const ids = (inactiveUsers || []).map((u: any) => u.user_id);
          query = query.in("id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);
        }

        // Apply search by full name or email (via authMap lookup)
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

        if (profilesError) {
          throw new Error(`[Users.profilesQuery] ${profilesError.message}`);
        }

        const usersWithDetails: UserWithDetails[] = [];
        if (profiles && profiles.length > 0) {
          const profileIds = profiles.map((p: any) => p.id);

          // Fetch user stats
          const { data: statsData, error: statsError } = await supabaseAdmin
            .from("user_stats")
            .select("*")
            .in("user_id", profileIds);
          if (statsError) {
            throw new Error(`[Users.statsQuery] ${statsError.message}`);
          }

          const statsMap: Record<string, any> = {};
          (statsData || []).forEach((s: any) => {
            statsMap[s.user_id] = s;
          });

          profiles.forEach((p) => {
            const authUser = authMap.get(p.id);
            usersWithDetails.push({
              id: p.id,
              email: authUser?.email || "N/A",
              created_at: authUser?.created_at || p.updated_at || "",
              app_metadata: authUser?.app_metadata || {},
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
    staleTime: 10 * 1000, // users cache stale after 10s
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
      
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, avatar_url, updated_at")
        .eq("id", userId)
        .single();
      if (profileError) {
        throw new Error(`[Users.userDetailProfile] ${profileError.message}`);
      }

      let stats = null;
      if (profile) {
        const { data: statsData, error: statsError } = await supabaseAdmin
          .from("user_stats")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        if (statsError) {
          throw new Error(`[Users.userDetailStats] ${statsError.message}`);
        }
        stats = statsData;
      }

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (authError) {
        throw new Error(`[Users.userDetailAuth] ${authError.message}`);
      }
      const authUser = authData?.user;

      if (!profile && !authUser) return null;

      return {
        id: userId,
        email: authUser?.email || "N/A",
        created_at: authUser?.created_at || "",
        app_metadata: authUser?.app_metadata || {},
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
    staleTime: 10 * 1000,
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

      if (error) {
        throw new Error(`[Users.userQuizHistory] ${error.message}`);
      }
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
    staleTime: 10 * 1000,
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

      if (error) {
        throw new Error(`[Users.userPurchases] ${error.message}`);
      }
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
    staleTime: 10 * 1000,
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
        user_metadata: { role: "admin" },
      });

      if (error) {
        throw new Error(error.message);
      }
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
      if (error) {
        throw new Error(error.message);
      }
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
