import React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Bell, MessageSquare, AlertCircle, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { useNavigate } from "react-router";

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();

  // 1. Unread feedback count query
  const { data: unreadFeedback = 0 } = useQuery({
    queryKey: ["feedback", "unread-count"],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabaseAdmin
        .from("feedback")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");
      if (error) throw error;
      return count || 0;
    },
    staleTime: 15 * 1000,
  });

  // 2. Disputed purchases count query
  const { data: disputedPurchases = 0 } = useQuery({
    queryKey: ["purchases", "disputed-count"],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabaseAdmin
        .from("purchases")
        .select("*", { count: "exact", head: true })
        .eq("status", "disputed");
      if (error) throw error;
      return count || 0;
    },
    staleTime: 15 * 1000,
  });

  const totalNotifications = unreadFeedback + disputedPurchases;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className="relative p-2 rounded-md hover:bg-accent hover:text-accent-foreground border transition-all duration-200"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4 text-foreground" />
          {totalNotifications > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2 select-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-72 rounded-lg border border-border bg-card p-4 shadow-xl focus:outline-none select-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          align="end"
          sideOffset={8}
        >
          <div className="flex items-center justify-between border-b pb-2 mb-3">
            <h3 className="text-sm font-bold text-foreground tracking-tight font-heading">Notifications</h3>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-semibold text-muted-foreground">
              {totalNotifications} Alert{totalNotifications === 1 ? "" : "s"}
            </span>
          </div>

          <div className="space-y-2.5">
            {totalNotifications === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center text-center">
                <Check className="h-8 w-8 text-emerald-500 bg-emerald-500/10 p-1.5 rounded-full mb-2" />
                <p className="text-sm font-semibold text-foreground">All clear!</p>
                <p className="text-sm text-muted-foreground mt-0.5">No outstanding system alerts.</p>
              </div>
            ) : (
              <>
                {unreadFeedback > 0 && (
                  <button
                    onClick={() => {
                      navigate("/feedback");
                    }}
                    className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-accent transition text-left group"
                  >
                    <MessageSquare className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        Unread Student Feedback
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        There are {unreadFeedback} feedback submission{unreadFeedback === 1 ? "" : "s"} requiring attention.
                      </p>
                    </div>
                  </button>
                )}

                {disputedPurchases > 0 && (
                  <button
                    onClick={() => {
                      navigate("/purchases");
                    }}
                    className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-accent transition text-left group"
                  >
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        Disputed Transactions
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        There are {disputedPurchases} transaction{disputedPurchases === 1 ? "" : "s"} flagged as disputed.
                      </p>
                    </div>
                  </button>
                )}
              </>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default NotificationBell;
