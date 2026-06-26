import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "../../shared/ChartCard";

interface RevenueChartProps {
  data?: { month: string; revenue: number }[];
  fromDate?: string;
  toDate?: string;
}

function formatRange(from?: string, to?: string): string {
  if (!from || !to) return "Monthly revenue breakdown for the last 6 months";
  const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `Revenue breakdown — ${fmt(from)} to ${fmt(to)}`;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data = [], fromDate, toDate }) => {
  return (
    <ChartCard
      title="Revenue Overview"
      description={formatRange(fromDate, toDate)}
      data={data}
      filename="revenue_data"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 6, left: -10, bottom: 0 }}
        >
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
            tickFormatter={(value) => `$${value}`}
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
            cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
            formatter={(value: number) => [`$${value}`, "Revenue"]}
          />
          <Bar
            dataKey="revenue"
            fill="var(--color-primary)"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
