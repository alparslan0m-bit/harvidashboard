import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import type { PurchasesPageData } from "@/types/api";

export function usePurchaseMutations() {
  const queryClient = useQueryClient();

  const refundPurchaseMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      const { data, error } = await supabaseAdmin
        .from("purchases")
        .update({ status: "refunded" })
        .eq("id", purchaseId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onMutate: async (purchaseId) => {
      await queryClient.cancelQueries({ queryKey: ["purchases"] });
      const previousQueries = queryClient.getQueriesData({ queryKey: ["purchases"] });
      queryClient.setQueriesData({ queryKey: ["purchases"] }, (old: PurchasesPageData | undefined) => {
        if (!old?.purchases) return old;
        return {
          ...old,
          purchases: old.purchases.map((p) =>
            p.id === purchaseId ? { ...p, status: "refunded" as const } : p,
          ),
        };
      });
      return { previousQueries };
    },
    onError: (err: unknown, _variables, context) => {
      context?.previousQueries?.forEach(([queryKey, value]) => {
        queryClient.setQueryData(queryKey, value);
      });
      toast.error(getErrorMessage(err, "Failed to refund transaction"));
    },
    onSuccess: () => toast.success("Transaction refunded successfully"),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    refundPurchase: refundPurchaseMutation.mutateAsync,
    isRefunding: refundPurchaseMutation.isPending,
  };
}
