import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "../../shared/ChartCard";

interface UserGrowthChartProps {
  data?: { month: string; users: number }[];
  fromDate?: string;
  toDate?: string;
}

function formatRange(from?: string, to?: string): string {
  if (!from || !to) return "Cumulative user registrations over the last 6 months";
  const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `Cumulative registrations — ${fmt(from)} to ${fmt(to)}`;
}

export const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ data = [], fromDate, toDate }) => {
  return (
    <ChartCard
      title="User Growth"
      description={formatRange(fromDate, toDate)}
      data={data}
      filename="user_growth"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 6, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke="var(--color-border)"
          />
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 13 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 13 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
              color: "var(--color-foreground)",
              fontSize: "13px",
              borderRadius: "var(--radius)",
              padding: "8px 12px",
            }}
            labelStyle={{ fontWeight: 600 }}
            cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="users"
            stroke="var(--color-chart-2)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#growthGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
