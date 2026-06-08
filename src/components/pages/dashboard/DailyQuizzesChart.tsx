import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "../../shared/ChartCard";

interface DailyQuizzesChartProps {
  data: { name: string; quizzes: number }[];
}

export const DailyQuizzesChart: React.FC<DailyQuizzesChartProps> = ({ data }) => {
  // Compute average quiz value
  const avgValue = data.length > 0
    ? Math.round((data.reduce((acc, d) => acc + d.quizzes, 0) / data.length) * 10) / 10
    : 0;

  return (
    <ChartCard
      title="Daily Quizzes Completed"
      description="Volume of quiz attempts over the last 7 days"
      data={data}
      filename="daily_quizzes"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 6, left: -26, bottom: 0 }}
        >
          <defs>
            <linearGradient id="quizzesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke="var(--color-border)"
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
              color: "var(--color-foreground)",
              fontSize: "11px",
              borderRadius: "var(--radius)",
              padding: "8px 12px",
            }}
            labelStyle={{ fontWeight: 600 }}
            cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
          />
          {avgValue > 0 && (
            <ReferenceLine
              y={avgValue}
              stroke="var(--color-chart-3)"
              strokeDasharray="3 3"
              label={{
                value: `Avg: ${avgValue}`,
                position: "top",
                fill: "var(--color-muted-foreground)",
                fontSize: 10,
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="quizzes"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#quizzesGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default DailyQuizzesChart;
