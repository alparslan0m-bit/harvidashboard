import React from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { useDashboardRealtime } from "@/hooks/useDashboardRealtime";
import { AdminActivityList } from "@/components/pages/dashboard/AdminActivityList";

import {
  PageHeader,
  KPIGrid,
  LiveIndicator,
  ErrorView,
} from "@/components/shared";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Users,
  FileSpreadsheet,
  DollarSign,
  Award,
  RefreshCw,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { stats, recentData, isLoading, error, refetch } = useDashboard();
  const { isLive } = useDashboardRealtime();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-secondary rounded-[8px] w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-card rounded-[8px] border border-border"
            />
          ))}
        </div>
        <div className="h-64 bg-card rounded-[8px] border border-border" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorView
        title="Failed to load Dashboard data"
        message={error.message}
        onRetry={() => refetch()}
        className="mt-12"
      />
    );
  }

  const kpiCards = [
    {
      title: "Total Registered Users",
      value: stats?.totalUsers || 0,
      description: "Sign-ups synced from Auth",
      icon: <Users />,
      trend: stats
        ? { value: stats.usersTrend, label: "vs last period" }
        : null,
    },
    {
      title: "Quizzes Taken Today",
      value: stats?.quizzesToday || 0,
      description: "Attempts recorded since UTC midnight",
      icon: <FileSpreadsheet />,
      trend: stats
        ? { value: stats.quizzesTrend, label: "vs yesterday" }
        : null,
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats?.monthlyRevenueCents || 0),
      description: "Active subscription revenue this month",
      icon: <DollarSign />,
      trend: stats
        ? { value: stats.revenueTrend, label: "vs last month" }
        : null,
    },
    {
      title: "Average Quiz Score",
      value: `${stats?.averageQuizScore || 0}%`,
      description: "Average score across all quizzes",
      icon: <Award />,
    },
  ];

  const headerActions = (
    <div className="flex items-center gap-3">
      <LiveIndicator active={isLive} />
      <button
        onClick={() => refetch()}
        disabled={isLoading}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-gradient-to-r hover:from-primary/10 hover:to-chart-5/10 hover:border-primary/30 disabled:opacity-60 focus-ring"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
        <span>{isLoading ? "Refreshing…" : "Refresh metrics"}</span>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 pb-8">
      <PageHeader title="Dashboard Overview" actions={headerActions} />

      <KPIGrid cards={kpiCards} compact className="gap-4" />

      <div className="grid grid-cols-1">
        <h3 className="text-[12px] font-mono uppercase text-muted-foreground mb-4">
          Admin Activity Feed
        </h3>
        <AdminActivityList logs={recentData?.adminAuditLogs || []} />
      </div>
    </div>
  );
};

export default Dashboard;
