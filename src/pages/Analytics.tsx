import React, { useState, useMemo, useCallback } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import { PageHeader } from "../components/shared/PageHeader";
import { ErrorView } from "../components/shared/ErrorView";
import { KPIGrid } from "../components/shared/KPIGrid";
import { ChartCard } from "../components/shared/ChartCard";
import { EmptyChart } from "../components/shared/EmptyChart";
import { FilterBar } from "../components/shared/FilterBar";
import { formatCurrency } from "../lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FileText, Users, DollarSign, HelpCircle } from "lucide-react";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

const DATE_PRESETS = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "1y", days: 365 },
] as const;

const formatDateISO = (d: Date) => d.toISOString().split("T")[0];

export const Analytics: React.FC = () => {
  // Default range: last 30 days
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatDateISO(d);
  });
  const [toDate, setToDate] = useState(() => formatDateISO(new Date()));

  const { data, isLoading, error, refetch } = useAnalytics(fromDate, toDate);

  const applyPreset = useCallback((days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setFromDate(formatDateISO(start));
    setToDate(formatDateISO(end));
  }, []);

  // Build KPI cards from stats data
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
    [data?.stats]
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="h-14 bg-muted rounded-xl border"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl border"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-muted rounded-xl border"></div>
          <div className="h-80 bg-muted rounded-xl border"></div>
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

  const tooltipStyle = {
    backgroundColor: "var(--color-card)",
    borderColor: "var(--color-border)",
    fontSize: "11px",
    borderRadius: "var(--radius)",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Analytics"
        description="Comprehensive reporting across engagement, revenue, and content performance"
      />

      {/* Date filter toolbar with presets */}
      <FilterBar className="flex-col sm:flex-row gap-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Date Range</h3>
          <p className="text-[10px] text-muted-foreground">Modify reporting bounds for all charts</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date preset pills */}
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset.days)}
              className="px-3 py-1.5 rounded-md border text-[11px] font-semibold text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              {preset.label}
            </button>
          ))}

          <span className="text-xs text-muted-foreground mx-1">|</span>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none transition"
            aria-label="Analytics Start Date"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none transition"
            aria-label="Analytics End Date"
          />
        </div>
      </FilterBar>

      {/* KPI Stats Row — moved to top */}
      <KPIGrid cards={kpiCards} />

      {/* Grid of 4 Charts using ChartCard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
        {/* Chart 1: Daily Active Users */}
        <ChartCard
          title="Daily Active Users"
          description="Chronological student login counts in range"
          data={data?.dailyActiveUsers}
          filename="daily_active_users"
        >
          {(data?.dailyActiveUsers?.length ?? 0) === 0 ? (
            <EmptyChart message="No quiz activity recorded in this period" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.dailyActiveUsers} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis dataKey="name" stroke="currentColor" fontSize={9} className="text-muted-foreground" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" fontSize={9} className="text-muted-foreground" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Chart 2: Score Distribution */}
        <ChartCard
          title="Quiz Score Distribution"
          description="Grade performance density buckets"
          data={data?.scoreDistribution}
          filename="score_distribution"
        >
          {(data?.scoreDistribution?.length ?? 0) === 0 ? (
            <EmptyChart message="No scores recorded in this period" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.scoreDistribution} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis dataKey="range" stroke="currentColor" fontSize={9} className="text-muted-foreground" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" fontSize={9} className="text-muted-foreground" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Chart 3: Top 10 Lectures by Score */}
        <ChartCard
          title="Top 10 Lectures by Average Score"
          description="Easiest chapters ranked by scores"
          data={data?.topLecturesScore}
          filename="top_lectures_score"
        >
          {(data?.topLecturesScore?.length ?? 0) === 0 ? (
            <EmptyChart message="No lecture statistics available" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topLecturesScore} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                <XAxis type="number" stroke="currentColor" fontSize={9} className="text-muted-foreground" tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="currentColor" fontSize={9} className="text-muted-foreground" tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="average" fill="var(--color-chart-3)" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Chart 4: Purchase Status Breakdown */}
        <ChartCard
          title="Purchase Status Breakdown"
          description="Transactions state density percentages"
          data={data?.purchaseBreakdown}
          filename="purchase_breakdown"
        >
          {(data?.purchaseBreakdown?.length ?? 0) === 0 ? (
            <EmptyChart message="No purchases logged in this range" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.purchaseBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                  {data?.purchaseBreakdown.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
};
export default Analytics;
