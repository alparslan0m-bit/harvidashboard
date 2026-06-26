import React, { useState, useMemo, useCallback } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { PageHeader, ErrorView, KPIGrid } from "@/components/shared";
import { AnalyticsDateFilter, DATE_PRESETS } from "@/components/pages/analytics/AnalyticsDateFilter";
import { AnalyticsChartsGrid } from "@/components/pages/analytics/AnalyticsChartsGrid";
import { DailyQuizzesChart } from "@/components/pages/dashboard/DailyQuizzesChart";
import { UserGrowthChart } from "@/components/pages/dashboard/UserGrowthChart";
import { RevenueChart } from "@/components/pages/dashboard/RevenueChart";
import { formatCurrency } from "@/lib/utils";
import { FileText, Users, DollarSign, HelpCircle } from "lucide-react";

const formatDateISO = (d: Date) => d.toISOString().split("T")[0];

/** Check if the current from/to dates match a preset exactly. */
function detectPreset(fromDate: string, toDate: string): number | null {
  const todayStr = formatDateISO(new Date());
  if (toDate !== todayStr) return null;
  for (const preset of DATE_PRESETS) {
    const start = new Date();
    start.setDate(start.getDate() - preset.days);
    if (formatDateISO(start) === fromDate) return preset.days;
  }
  return null;
}

export const Analytics: React.FC = () => {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatDateISO(d);
  });
  const [toDate, setToDate] = useState(() => formatDateISO(new Date()));
  const [activePreset, setActivePreset] = useState<number | null>(30);

  const isInvalid = fromDate > toDate;

  const { data, isLoading, error, refetch } = useAnalytics(
    isInvalid ? "" : fromDate,
    isInvalid ? "" : toDate,
  );

  const applyPreset = useCallback((days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setFromDate(formatDateISO(start));
    setToDate(formatDateISO(end));
    setActivePreset(days);
  }, []);

  const handleFromDateChange = useCallback((value: string) => {
    setFromDate(value);
    // Auto-detect if the new dates match a preset
    setActivePreset(detectPreset(value, toDate) ?? null);
  }, [toDate]);

  const handleToDateChange = useCallback((value: string) => {
    setToDate(value);
    setActivePreset(detectPreset(fromDate, value) ?? null);
  }, [fromDate]);

  const kpiCards = useMemo(
    () => [
      {
        title: "Total Quizzes Completed",
        value: data?.stats.totalQuizzes ?? 0,
        description: "In selected date bounds",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        title: "New Student Sign-ups",
        value: data?.stats.newUsers ?? 0,
        description: "Registered profiles in period",
        icon: <Users className="h-4 w-4" />,
      },
      {
        title: "Calculated Revenue",
        value: formatCurrency(data?.stats.totalRevenueCents || 0),
        description: "Active purchases in period",
        icon: <DollarSign className="h-4 w-4" />,
      },
      {
        title: "Questions Answered",
        value: data?.stats.questionsAnswered ?? 0,
        description: "Aggregate item evaluations",
        icon: <HelpCircle className="h-4 w-4" />,
      },
    ],
    [data?.stats],
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-14 bg-muted rounded-xl border" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl border" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-80 bg-muted rounded-xl border" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorView
        title="Failed to load system analytics"
        message={error.message}
        onRetry={() => refetch()}
        className="mt-12"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="System Analytics" />
      <KPIGrid cards={kpiCards} compact colorful />
      <AnalyticsDateFilter
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
        onPreset={applyPreset}
        activePreset={activePreset}
      />
      <AnalyticsChartsGrid
        dailyActiveUsers={data?.dailyActiveUsers}
        purchaseBreakdown={data?.purchaseBreakdown}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyQuizzesChart data={data?.dailyQuizzes || []} fromDate={fromDate} toDate={toDate} />
        <UserGrowthChart data={data?.userGrowth} fromDate={fromDate} toDate={toDate} />
      </div>

      <RevenueChart data={data?.revenue} fromDate={fromDate} toDate={toDate} />
    </div>
  );
};

export default Analytics;
