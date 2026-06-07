import React from "react";
import { useDashboard } from "../hooks/useDashboard";
import { MetricCard } from "../components/shared/MetricCard";
import { DailyQuizzesChart } from "../components/pages/dashboard/DailyQuizzesChart";
import { TopLecturesChart } from "../components/pages/dashboard/TopLecturesChart";
import { RecentStudentsTable } from "../components/pages/dashboard/RecentStudentsTable";
import { RecentPurchasesTable } from "../components/pages/dashboard/RecentPurchasesTable";
import { formatCurrency } from "../lib/utils";
import {
  Users,
  FileSpreadsheet,
  DollarSign,
  Award,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { stats, recentData, isLoading, error, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        {/* Metric Cards Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-xl border"></div>
          ))}
        </div>

        {/* Charts Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[360px] bg-muted rounded-xl border"></div>
          <div className="h-[360px] bg-muted rounded-xl border"></div>
        </div>

        {/* Tables Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[400px] bg-muted rounded-xl border"></div>
          <div className="h-[400px] bg-muted rounded-xl border"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card border border-destructive/20 rounded-xl max-w-md mx-auto mt-12 text-center select-none">
        <div className="h-10 w-10 text-destructive bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Failed to load Dashboard data
        </h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">
          {error.message}
        </p>
        <button
          onClick={refetch}
          className="mt-4 flex items-center gap-2 px-4 py-2 text-xs font-semibold border rounded-md hover:bg-accent hover:text-accent-foreground transition"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Dashboard overview
            </p>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Learning operations at a glance
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Realtime user activity, quiz volume, revenue trends, and recent
                student and purchase signals.
              </p>
            </div>
          </div>

          <button
            onClick={refetch}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:border-slate-300 hover:bg-accent/80 hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 transition ${isLoading ? "animate-spin" : ""}`}
            />
            <span>{isLoading ? "Refreshing…" : "Refresh metrics"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Registered Users"
          value={stats?.totalUsers || 0}
          description="Sign-ups synced from Auth"
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Quizzes Taken Today"
          value={stats?.quizzesToday || 0}
          description="Attempts recorded since UTC midnight"
          icon={<FileSpreadsheet className="h-5 w-5" />}
        />
        <MetricCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.monthlyRevenueCents || 0)}
          description="Active subscription revenue this month"
          icon={
            <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          }
        />
        <MetricCard
          title="Average Quiz Score"
          value={`${stats?.averageQuizScore || 0}%`}
          description="Average score across all quizzes"
          icon={
            <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          }
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyQuizzesChart data={recentData?.dailyQuizzes || []} />
        <TopLecturesChart data={recentData?.topLectures || []} />
      </div>

      {/* Recent Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentStudentsTable students={recentData?.recentStudents || []} />
        <RecentPurchasesTable purchases={recentData?.recentPurchases || []} />
      </div>
    </div>
  );
};
export default Dashboard;
