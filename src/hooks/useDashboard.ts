import { useQuery } from "@tanstack/react-query";
import { STALE_TIMES } from "@/lib/constants";
import { fetchDashboardData } from "@/services/dashboardService";

export type { DashboardStats, DashboardData, AdminAuditLog } from "@/types/dashboard";

export function useDashboard() {
  const dashboardQuery = useQuery({
    queryKey: ["dashboard", "all-data"],
    queryFn: fetchDashboardData,
    staleTime: STALE_TIMES.dashboard,
  });

  return {
    stats: dashboardQuery.data?.stats,
    recentData: dashboardQuery.data?.recentData,
    isLoading: dashboardQuery.isLoading,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
  };
}
