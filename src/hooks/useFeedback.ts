import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { QUERY_KEYS } from "../lib/queryKeys";
import { toast } from "sonner";
import type { FeedbackWithUser } from "../types/database";

export function useFeedback(page: number, status: string) {
  const pageSize = 25;

  const feedbackQuery = useQuery({
    queryKey: QUERY_KEYS.feedback(page, status),
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
          throw new Error(`[Feedback.listUsers] ${authError.message}`);
        }
        const authUsers = authData?.users || [];
        const authMap = new Map<string, typeof authUsers[0]>();
        authUsers.forEach((u) => {
          authMap.set(u.id, u);
        });

        // 2. Base query
        let query = supabaseAdmin
          .from("feedback")
          .select("*", { count: "exact" });

        // Filter by status tab
        if (status && status !== "all") {
          query = query.eq("status", status);
        }

        const { data, count, error: feedbackError } = await query
          .order("created_at", { ascending: false })
          .range(from, to);

        if (feedbackError) {
          throw new Error(`[Feedback.feedbackQuery] ${feedbackError.message}`);
        }

        const resolvedFeedback: any[] = [];
        if (data && data.length > 0) {
          const userIds = Array.from(new Set(data.map((f: any) => f.user_id).filter(Boolean))) as string[];
          
          let profiles: any[] = [];
          if (userIds.length > 0) {
            const { data: profileData, error: profileError } = await supabaseAdmin
              .from("profiles")
              .select("id, full_name")
              .in("id", userIds);
            if (profileError) {
              throw new Error(`[Feedback.profilesQuery] ${profileError.message}`);
            }
            profiles = profileData || [];
          }

          data.forEach((f: any) => {
            const profile = profiles.find((p: any) => p.id === f.user_id) || null;
            const authUser = f.user_id ? authMap.get(f.user_id) : null;
            resolvedFeedback.push({
              ...f,
              profiles: profile,
              status: f.status as any,
              userEmail: authUser?.email || "Anonymous Student",
            });
          });
        }

        return {
          feedbackList: resolvedFeedback,
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        };
      } catch (err: any) {
        throw new Error(err.message || "Failed to load feedback logs");
      }
    },
    staleTime: 10 * 1000, // feedback list stale after 10s
  });

  const unreadCountQuery = useQuery({
    queryKey: QUERY_KEYS.feedbackUnreadCount,
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabaseAdmin
        .from("feedback")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");
      if (error) {
        throw new Error(`[Feedback.unreadCountQuery] ${error.message}`);
      }
      return count || 0;
    },
    staleTime: 10 * 1000, // unread count stale after 10s
  });

  return {
    data: feedbackQuery.data,
    isLoading: feedbackQuery.isLoading,
    error: feedbackQuery.error,
    refetch: feedbackQuery.refetch,
    unreadCount: unreadCountQuery.data || 0,
  };
}

export function useFeedbackMutations(page: number, statusFilter: string) {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'new' | 'read' | 'resolved' | 'archived' }) => {
      const { data, error } = await supabaseAdmin
        .from("feedback")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.feedback(page, statusFilter) });
      const previousState = queryClient.getQueryData(QUERY_KEYS.feedback(page, statusFilter));

      queryClient.setQueryData(QUERY_KEYS.feedback(page, statusFilter), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          feedbackList: old.feedbackList.map((item: any) =>
            item.id === id ? { ...item, status } : item
          ),
        };
      });

      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.feedbackUnreadCount });
      const previousUnread = queryClient.getQueryData<number>(QUERY_KEYS.feedbackUnreadCount) || 0;

      return { previousState, previousUnread };
    },
    onError: (err: any, _variables, context) => {
      if (context?.previousState) {
        queryClient.setQueryData(QUERY_KEYS.feedback(page, statusFilter), context.previousState);
      }
      if (context?.previousUnread !== undefined) {
        queryClient.setQueryData(QUERY_KEYS.feedbackUnreadCount, context.previousUnread);
      }
      toast.error(err.message || "Failed to update feedback status");
    },
    onSuccess: () => {
      toast.success("Feedback status updated");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feedback(page, statusFilter) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feedbackUnreadCount });
    },
  });

  const deleteFeedbackMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAdmin.from("feedback").delete().eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Feedback log deleted");
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete feedback log");
    },
  });

  return {
    updateStatus: updateStatusMutation.mutateAsync,
    deleteFeedback: deleteFeedbackMutation.mutateAsync,
  };
}
