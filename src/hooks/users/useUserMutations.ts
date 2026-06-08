import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";

export function useUserMutations() {
  const queryClient = useQueryClient();

  const grantAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        app_metadata: { role: "admin" },
        user_metadata: { role: "admin" },
      });
      if (error) throw new Error(error.message);
      return data.user;
    },
    onSuccess: (_, userId) => {
      toast.success("Admin role granted successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userDetail(userId) });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to grant admin role")),
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, "Failed to delete user")),
  });

  return {
    grantAdmin: grantAdminMutation.mutateAsync,
    isGranting: grantAdminMutation.isPending,
    deleteUser: deleteUserMutation.mutateAsync,
    isDeleting: deleteUserMutation.isPending,
  };
}
