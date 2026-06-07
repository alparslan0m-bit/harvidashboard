import React, { useState } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import { MetricCard } from "../components/shared/MetricCard";
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
import { FileText, Users, DollarSign, HelpCircle, RefreshCw, AlertTriangle } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export const Analytics: React.FC = () => {
  // Default range: last 30 days
  const defaultFrom = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  };
  const defaultTo = () => new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(defaultFrom());
  const [toDate, setToDate] = useState(defaultTo());

  const { data, isLoading, error, refetch } = useAnalytics(fromDate, toDate);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="h-14 bg-muted rounded-xl border"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-muted rounded-xl border"></div>
          <div className="h-80 bg-muted rounded-xl border"></div>
          <div className="h-80 bg-muted rounded-xl border"></div>
          <div className="h-80 bg-muted rounded-xl border"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl border"></div>
          ))}
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
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Failed to load system analytics</h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 flex items-center gap-2 px-4 py-2 text-xs font-semibold border rounded-md hover:bg-accent hover:text-accent-foreground transition"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border p-4 rounded-xl shadow-sm select-none">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Date Range Filter</h3>
          <p className="text-[10px] text-muted-foreground">Modify reporting bounds for all charts</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none transition"
            aria-label="Analytics Start Date"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none transition"
            aria-label="Analytics End Date"
          />
        </div>
      </div>

      {/* Grid of 4 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
        {/* Chart 1: Daily Active Users */}
        <div className="border rounded-xl bg-card p-6 shadow-sm flex flex-col h-[320px]">
          <div className="mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Daily Active Users</h4>
            <p className="text-[10px] text-muted-foreground">Chronological student login counts in range</p>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.dailyActiveUsers} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis dataKey="name" stroke="currentColor" fontSize={9} className="text-muted-foreground" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" fontSize={9} className="text-muted-foreground" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", fontSize: "11px", borderRadius: "var(--radius)" }} />
                <Line type="monotone" dataKey="count" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Score Distribution */}
        <div className="border rounded-xl bg-card p-6 shadow-sm flex flex-col h-[320px]">
          <div className="mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Quiz score distribution</h4>
            <p className="text-[10px] text-muted-foreground">Grade performance density buckets</p>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.scoreDistribution} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis dataKey="range" stroke="currentColor" fontSize={9} className="text-muted-foreground" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" fontSize={9} className="text-muted-foreground" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", fontSize: "11px", borderRadius: "var(--radius)" }} />
                <Bar dataKey="count" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Top 10 Lectures Score */}
        <div className="border rounded-xl bg-card p-6 shadow-sm flex flex-col h-[320px]">
          <div className="mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Top 10 Lectures by Average score</h4>
            <p className="text-[10px] text-muted-foreground">Easiest chapters ranked by scores</p>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topLecturesScore} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                <XAxis type="number" stroke="currentColor" fontSize={9} className="text-muted-foreground" tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="currentColor" fontSize={9} className="text-muted-foreground" tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", fontSize: "11px", borderRadius: "var(--radius)" }} />
                <Bar dataKey="average" fill="var(--color-chart-3)" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Purchase Status Breakdown */}
        <div className="border rounded-xl bg-card p-6 shadow-sm flex flex-col h-[320px]">
          <div className="mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Purchase status breakdown</h4>
            <p className="text-[10px] text-muted-foreground">Transactions state density percentages</p>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            {data?.purchaseBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground">No purchases logged in range.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.purchaseBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                    {data?.purchaseBreakdown.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards Row below charts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 select-none">
        <MetricCard
          title="Total Quizzes completed"
          value={data?.stats.totalQuizzes || 0}
          description="In selected date bounds"
          icon={<FileText className="h-4 w-4" />}
        />
        <MetricCard
          title="New Student sign-ups"
          value={data?.stats.newUsers || 0}
          description="Registered profiles in period"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Calculated Revenue"
          value={formatCurrency(data?.stats.totalRevenueCents || 0)}
          description="Active purchases in period"
          icon={<DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />}
        />
        <MetricCard
          title="Questions Answered"
          value={data?.stats.questionsAnswered || 0}
          description="Aggregate item evaluations"
          icon={<HelpCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
        />
      </div>
    </div>
  );
};
export default Analytics;
