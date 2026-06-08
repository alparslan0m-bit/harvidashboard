import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export function useDashboardRealtime() {
  const queryClient = useQueryClient();
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const channel = supabaseAdmin
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "quiz_results" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    return () => {
      supabaseAdmin.removeChannel(channel);
    };
  }, [queryClient]);

  return { isLive };
}
