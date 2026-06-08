import React, { useState, useEffect } from "react";
import { useDashboard } from "../hooks/useDashboard";
import { DailyQuizzesChart } from "../components/pages/dashboard/DailyQuizzesChart";
import { TopLecturesChart } from "../components/pages/dashboard/TopLecturesChart";
import { RecentStudentsTable } from "../components/pages/dashboard/RecentStudentsTable";
import { RecentPurchasesTable } from "../components/pages/dashboard/RecentPurchasesTable";
import { PageHeader } from "../components/shared/PageHeader";
import { KPIGrid } from "../components/shared/KPIGrid";
import { LiveIndicator } from "../components/shared/LiveIndicator";
import { ErrorView } from "../components/shared/ErrorView";
import { formatCurrency, cn } from "../lib/utils";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  Users,
  FileSpreadsheet,
  DollarSign,
  Award,
  RefreshCw,
  Plus,
  ShoppingBag,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { stats, recentData, isLoading, error, refetch } = useDashboard();
  const [isLive, setIsLive] = useState(false);

  // Supabase real-time updates subscription
  useEffect(() => {
    const channel = supabaseAdmin
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "quiz_results" },
        () => {
          // Invalidate both stats and dashboard recent activity queries
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        }
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    return () => {
      supabaseAdmin.removeChannel(channel);
    };
  }, [queryClient]);

  // Loading Skeleton structure
  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse select-none">
        {/* Title skeleton */}
        <div className="h-10 bg-muted rounded-lg border w-1/3 mb-4"></div>
        {/* KPI grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-xl border"></div>
          ))}
        </div>
        {/* Quick action skeleton */}
        <div className="h-14 bg-muted rounded-xl border w-full"></div>
        {/* Chart row skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-72 bg-muted rounded-xl border"></div>
          <div className="h-72 bg-muted rounded-xl border"></div>
        </div>
        {/* Data logs row skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-[280px] bg-muted rounded-xl border"></div>
          <div className="h-[280px] bg-muted rounded-xl border"></div>
        </div>
      </div>
    );
  }

  // Error boundary fallback
  if (error) {
    return (
      <ErrorView
        title="Failed to load Dashboard data"
        message={error.message}
        onRetry={refetch}
        className="mt-12"
      />
    );
  }

  // Map KPI values and computed trends
  const kpiCards = [
    {
      title: "Total Registered Users",
      value: stats?.totalUsers || 0,
      description: "Sign-ups synced from Auth",
      icon: <Users />,
      trend: stats ? { value: stats.usersTrend, label: "vs last period" } : null,
      color: "zinc" as const,
    },
    {
      title: "Quizzes Taken Today",
      value: stats?.quizzesToday || 0,
      description: "Attempts recorded since UTC midnight",
      icon: <FileSpreadsheet />,
      trend: stats ? { value: stats.quizzesTrend, label: "vs yesterday" } : null,
      color: "zinc" as const,
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats?.monthlyRevenueCents || 0),
      description: "Active subscription revenue this month",
      icon: <DollarSign />,
      trend: stats ? { value: stats.revenueTrend, label: "vs last month" } : null,
      color: "emerald" as const,
    },
    {
      title: "Average Quiz Score",
      value: `${stats?.averageQuizScore || 0}%`,
      description: "Average score across all quizzes",
      icon: <Award />,
      color: "indigo" as const,
    },
  ];

  const headerActions = (
    <div className="flex items-center gap-3">
      <LiveIndicator active={isLive} />
      <button
        onClick={refetch}
        disabled={isLoading}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-border/60 bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
        <span>{isLoading ? "Refreshing…" : "Refresh metrics"}</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <PageHeader
        title="Dashboard Overview"
        description="Realtime user activity, quiz volume, revenue trends, and recent student and purchase signals."
        actions={headerActions}
      />

      {/* Metric KPI cards */}
      <KPIGrid cards={kpiCards} />

      {/* Quick Actions Row */}
      <div className="flex flex-wrap items-center gap-3 bg-card border border-border/60 p-4 rounded-xl shadow-xs select-none">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mr-2">
          Quick Actions:
        </span>
        <button
          onClick={() => navigate("/questions?action=new")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 text-xs font-semibold text-foreground hover:bg-accent transition-all duration-200 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Question</span>
        </button>
        <button
          onClick={() => navigate("/import")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 text-xs font-semibold text-foreground hover:bg-accent transition-all duration-200 cursor-pointer"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>Upload CSV</span>
        </button>
        <button
          onClick={() => navigate("/purchases")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 text-xs font-semibold text-foreground hover:bg-accent transition-all duration-200 cursor-pointer"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>View Purchases</span>
        </button>
      </div>

      {/* Analytics Charts - Grid with equal heights h-72 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DailyQuizzesChart data={recentData?.dailyQuizzes || []} />
        <TopLecturesChart data={recentData?.topLectures || []} />
      </div>

      {/* Recent Activity Log Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RecentStudentsTable students={recentData?.recentStudents || []} />
        <RecentPurchasesTable purchases={recentData?.recentPurchases || []} />
      </div>
    </div>
  );
};

export default Dashboard;
