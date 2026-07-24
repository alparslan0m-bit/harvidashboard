import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export function useDashboardRealtime() {
  const queryClient = useQueryClient();
  const [isLive, setIsLive] = useState(false);
  const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const channel = supabaseAdmin
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "quiz_results" },
        () => {
          if (!throttleTimerRef.current) {
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            throttleTimerRef.current = setTimeout(() => {
              throttleTimerRef.current = null;
            }, 15000);
          }
        },
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      supabaseAdmin.removeChannel(channel);
    };
  }, [queryClient]);

  return { isLive };
}
