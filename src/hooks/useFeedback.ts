import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { QUERY_KEYS } from "../lib/queryKeys";
import { PAGE_SIZE, STALE_TIMES } from "../lib/constants";
import { getErrorMessage } from "../lib/errors";
import { listAllAuthUsers } from "../services/authService";
import { toast } from "sonner";
import type { FeedbackListItem, FeedbackPageData } from "../types/api";
import type { FeedbackStatus } from "../lib/constants";

export function useFeedback(page: number, status: string) {
  const feedbackQuery = useQuery({
    queryKey: QUERY_KEYS.feedback(page, status),
    queryFn: async (): Promise<FeedbackPageData> => {
      try {
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const authUsers = await listAllAuthUsers("Feedback");
        const authMap = new Map(authUsers.map((u) => [u.id, u]));
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

        const resolvedFeedback: FeedbackListItem[] = [];
        if (data && data.length > 0) {
          const userIds = Array.from(
            new Set(data.map((f) => f.user_id).filter(Boolean)),
          ) as string[];

          let profiles: { id: string; full_name: string | null }[] = [];
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

          data.forEach((f) => {
            const profile = profiles.find((p) => p.id === f.user_id) || null;
            const authUser = f.user_id ? authMap.get(f.user_id) : null;
            resolvedFeedback.push({
              ...f,
              profiles: profile,
              status: f.status as FeedbackStatus,
              userEmail: authUser?.email || "Anonymous Student",
            });
          });
        }

        return {
          feedbackList: resolvedFeedback,
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / PAGE_SIZE),
        };
      } catch (err: unknown) {
        throw new Error(getErrorMessage(err, "Failed to load feedback logs"));
      }
    },
    staleTime: STALE_TIMES.feedback,
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
    staleTime: STALE_TIMES.feedback,
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
