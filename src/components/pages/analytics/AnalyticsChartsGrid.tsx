import React from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ChartCard } from "@/components/shared/ChartCard";
import { EmptyChart } from "@/components/shared/EmptyChart";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];
const tooltipStyle = {
  backgroundColor: "var(--color-card)",
  borderColor: "var(--color-border)",
  fontSize: "11px",
  borderRadius: "var(--radius)",
};

interface AnalyticsChartsGridProps {
  dailyActiveUsers?: { name: string; count: number }[];
  scoreDistribution?: { range: string; count: number }[];
  topLecturesScore?: { name: string; average: number }[];
  purchaseBreakdown?: { name: string; value: number }[];
}

export const AnalyticsChartsGrid: React.FC<AnalyticsChartsGridProps> = ({
  dailyActiveUsers,
  scoreDistribution,
  topLecturesScore,
  purchaseBreakdown,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
    <ChartCard title="Daily Active Users" description="Chronological student login counts" data={dailyActiveUsers} filename="daily_active_users">
      {!dailyActiveUsers?.length ? (
        <EmptyChart description="No quiz activity recorded in this period" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyActiveUsers} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
            <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="count" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartCard>

    <ChartCard title="Quiz Score Distribution" description="Grade performance density buckets" data={scoreDistribution} filename="score_distribution">
      {!scoreDistribution?.length ? (
        <EmptyChart description="No scores recorded in this period" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={scoreDistribution} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
            <XAxis dataKey="range" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>

    <ChartCard title="Top 10 Lectures by Average Score" description="Easiest chapters ranked" data={topLecturesScore} filename="top_lectures_score">
      {!topLecturesScore?.length ? (
        <EmptyChart description="No lecture statistics available" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topLecturesScore} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
            <XAxis type="number" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis dataKey="name" type="category" fontSize={9} tickLine={false} axisLine={false} width={80} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="average" fill="var(--color-chart-3)" radius={[0, 4, 4, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>

    <ChartCard title="Purchase Status Breakdown" description="Transactions state density" data={purchaseBreakdown} filename="purchase_breakdown">
      {!purchaseBreakdown?.length ? (
        <EmptyChart description="No purchases logged in this range" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={purchaseBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
              {purchaseBreakdown.map((_entry, index) => (
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
);
