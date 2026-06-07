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

interface DailyQuizzesChartProps {
  data: { name: string; quizzes: number }[];
}

export const DailyQuizzesChart: React.FC<DailyQuizzesChartProps> = ({
  data,
}) => {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col h-[360px] overflow-hidden">
      <div className="mb-4">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Daily Quizzes Completed
        </h2>
        <p className="text-xs text-muted-foreground">
          Volume of quiz attempts over the last 7 days
        </p>
      </div>

      <div className="flex-1 w-full min-h-0 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 18, right: 6, left: -26, bottom: 0 }}
          >
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
                fontSize: "12px",
                borderRadius: "var(--radius)",
                padding: "10px",
              }}
              labelStyle={{ fontWeight: 600 }}
              cursor={{ fill: "var(--color-muted)", opacity: 0.15 }}
            />
            <Bar
              dataKey="quizzes"
              fill="var(--color-chart-1)"
              radius={[4, 4, 0, 0]}
              maxBarSize={45}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default DailyQuizzesChart;
