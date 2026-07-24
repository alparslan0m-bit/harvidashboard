import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { QUERY_KEYS } from "@/lib/queryKeys";
import type { UserWithDetails, QuizResultWithLecture, PurchaseWithDetails } from "@/types/database";

export function useUserDetail(userId: string | null) {
  const userDetailQuery = useQuery({
    queryKey: QUERY_KEYS.userDetail(userId || ""),
    queryFn: async (): Promise<UserWithDetails | null> => {
      if (!userId) return null;

      const [profileRes, authRes] = await Promise.all([
        supabaseAdmin
          .from("profiles")
          .select("id, full_name, avatar_url, updated_at")
          .eq("id", userId)
          .maybeSingle(),
        supabaseAdmin.auth.admin.getUserById(userId),
      ]);

      if (profileRes.error) throw new Error(`[Users.userDetailProfile] ${profileRes.error.message}`);
      if (authRes.error) throw new Error(`[Users.userDetailAuth] ${authRes.error.message}`);

      const profile = profileRes.data;
      const authUser = authRes.data?.user;

      let stats = null;
      if (profile) {
        const { data: statsData, error: statsError } = await supabaseAdmin
          .from("user_stats")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        if (statsError) throw new Error(`[Users.userDetailStats] ${statsError.message}`);
        stats = statsData;
      }

      if (!profile && !authUser) return null;

      return {
        id: userId,
        email: authUser?.email || "N/A",
        created_at: authUser?.created_at || "",
        app_metadata: authUser?.app_metadata || {},
        profile: profile
          ? { id: profile.id, full_name: profile.full_name, avatar_url: profile.avatar_url, updated_at: profile.updated_at }
          : null,
        stats,
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
      if (error) throw new Error(`[Users.userQuizHistory] ${error.message}`);
      return (data || []).map((row) => ({
        id: row.id,
        user_id: row.user_id,
        lecture_id: row.lecture_id,
        score: row.score,
        total_questions: row.total_questions,
        correct_answers: row.correct_answers,
        created_at: row.created_at,
        lectures: row.lectures as unknown as QuizResultWithLecture["lectures"],
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
        .select("id, user_id, status, amount_cents, currency, created_at, module_id, modules(name), payment_id, payment_session_id, provider, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(`[Users.userPurchases] ${error.message}`);
      return (data || []).map((row) => ({
        id: row.id,
        user_id: row.user_id,
        module_id: row.module_id,
        status: row.status,
        amount_cents: row.amount_cents,
        currency: row.currency,
        payment_id: row.payment_id,
        payment_session_id: row.payment_session_id,
        provider: row.provider,
        created_at: row.created_at,
        updated_at: row.updated_at,
        modules: row.modules as unknown as PurchaseWithDetails["modules"],
      }));
    },
    enabled: !!userId,
    staleTime: 10 * 1000,
  });

  const refetch = () => {
    void userDetailQuery.refetch();
    void quizHistoryQuery.refetch();
    void purchasesQuery.refetch();
  };

  return {
    user: userDetailQuery.data,
    quizHistory: quizHistoryQuery.data || [],
    purchases: purchasesQuery.data || [],
    isLoading:
      userDetailQuery.isLoading ||
      quizHistoryQuery.isLoading ||
      purchasesQuery.isLoading,
    error:
      userDetailQuery.error ?? quizHistoryQuery.error ?? purchasesQuery.error,
    refetch,
  };
}
