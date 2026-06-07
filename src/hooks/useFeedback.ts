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

        // Base query
        let query = supabaseAdmin
          .from("feedback")
          .select("*", { count: "exact" });

        // Filter by status tab
        if (status && status !== "all") {
          query = query.eq("status", status);
        }

        const { data, count, error } = await query
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) throw error;

        // Resolve user profiles & emails via service role client
        const feedbackWithUser: FeedbackWithUser[] = [];
        const authUsers: any[] = [];
        if (data && data.length > 0) {
          const userIds = Array.from(new Set(data.map((f: any) => f.user_id).filter(Boolean))) as string[];
          
          let profiles: any[] = [];
          if (userIds.length > 0) {
            const { data: profileData } = await supabaseAdmin
              .from("profiles")
              .select("id, full_name")
              .in("id", userIds);
            profiles = profileData || [];
          }

          const resolvedAuthUsers = await Promise.all(
            data.map(async (f: any) => {
              if (!f.user_id) return null;
              try {
                const { data: userData } = await supabaseAdmin.auth.admin.getUserById(f.user_id);
                return userData?.user || null;
              } catch {
                return null;
              }
            })
          );
          authUsers.push(...resolvedAuthUsers);

          data.forEach((f: any) => {
            const profile = profiles.find((p: any) => p.id === f.user_id) || null;
            feedbackWithUser.push({
              ...f,
              profiles: profile,
              status: f.status as any,
            });
          });
        }

        // Map resolved emails
        const resolvedFeedback = feedbackWithUser.map((f: any, idx: number) => {
          const authUser = authUsers[idx];
          return {
            ...f,
            userEmail: authUser?.email || "Anonymous Student",
          };
        });

        return {
          feedbackList: resolvedFeedback,
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        };
      } catch (err: any) {
        throw new Error(err.message || "Failed to load feedback logs");
      }
    },
  });

  const unreadCountQuery = useQuery({
    queryKey: QUERY_KEYS.feedbackUnreadCount,
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabaseAdmin
        .from("feedback")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");
      if (error) throw error;
      return count || 0;
    },
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
      if (error) throw error;
      return data;
    },
    // OPTIMISTIC UPDATES: Spec requirement non-negotiable
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.feedback(page, statusFilter) });

      // Snapshot the previous state
      const previousState = queryClient.getQueryData(QUERY_KEYS.feedback(page, statusFilter));

      // Optimistically update the list cache
      queryClient.setQueryData(QUERY_KEYS.feedback(page, statusFilter), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          feedbackList: old.feedbackList.map((item: any) =>
            item.id === id ? { ...item, status } : item
          ),
        };
      });

      // Optimistically update unread count if transitioning to/from "new"
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.feedbackUnreadCount });
      const previousUnread = queryClient.getQueryData<number>(QUERY_KEYS.feedbackUnreadCount) || 0;

      // Return context containing previous state and unread count
      return { previousState, previousUnread };
    },
    onError: (err: any, _variables, context) => {
      // Rollback to previous state if error
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
      // Sync with real DB state
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feedback(page, statusFilter) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feedbackUnreadCount });
    },
  });

  const deleteFeedbackMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAdmin.from("feedback").delete().eq("id", id);
      if (error) throw error;
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
