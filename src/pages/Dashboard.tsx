import React from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { useDashboardRealtime } from "@/hooks/useDashboardRealtime";
import { DailyQuizzesChart } from "@/components/pages/dashboard/DailyQuizzesChart";
import { TopLecturesChart } from "@/components/pages/dashboard/TopLecturesChart";
import { RecentStudentsTable } from "@/components/pages/dashboard/RecentStudentsTable";
import { RecentPurchasesTable } from "@/components/pages/dashboard/RecentPurchasesTable";
import { PageHeader, KPIGrid, LiveIndicator, ErrorView } from "@/components/shared";
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
        <div className="h-10 bg-secondary rounded-[8px] w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-card rounded-[8px] border border-border"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-80 bg-card rounded-[8px] border border-border"></div>
          <div className="h-80 bg-card rounded-[8px] border border-border"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 bg-card rounded-[8px] border border-border"></div>
          <div className="h-64 bg-card rounded-[8px] border border-border"></div>
        </div>
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
      trend: stats ? { value: stats.usersTrend, label: "vs last period" } : null,
    },
    {
      title: "Quizzes Taken Today",
      value: stats?.quizzesToday || 0,
      description: "Attempts recorded since UTC midnight",
      icon: <FileSpreadsheet />,
      trend: stats ? { value: stats.quizzesTrend, label: "vs yesterday" } : null,
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats?.monthlyRevenueCents || 0),
      description: "Active subscription revenue this month",
      icon: <DollarSign />,
      trend: stats ? { value: stats.revenueTrend, label: "vs last month" } : null,
      featured: true,
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
        className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-60 focus-ring"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
        <span>{isLoading ? "Refreshing…" : "Refresh metrics"}</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="relative -mx-4 -mt-4 mb-6 sm:-mx-5 sm:-mt-5 lg:-mx-6 lg:-mt-6 px-4 py-8 sm:px-5 sm:py-10 lg:px-6 lg:py-12 border-b border-border bg-card overflow-hidden">
        <div className="absolute inset-0 z-0 bg-vercel-mesh opacity-20 dark:opacity-10 pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
        <div className="relative z-10">
          <PageHeader
            title="Dashboard Overview"
            actions={headerActions}
            className="mb-0"
          />
        </div>
      </div>

      <KPIGrid cards={kpiCards} compact className="gap-3" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyQuizzesChart data={recentData?.dailyQuizzes || []} />
        <TopLecturesChart data={recentData?.topLectures || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentStudentsTable students={recentData?.recentStudents || []} />
        <RecentPurchasesTable purchases={recentData?.recentPurchases || []} />
      </div>
    </div>
  );
};

export default Dashboard;
