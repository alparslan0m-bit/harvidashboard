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

interface TopLecturesChartProps {
  data: { name: string; attempts: number }[];
}

export const TopLecturesChart: React.FC<TopLecturesChartProps> = ({ data }) => {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col h-[360px] overflow-hidden">
      <div className="mb-4">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Top 5 Lectures by Attempts
        </h2>
        <p className="text-xs text-muted-foreground">
          Most popular lectures by total student completions
        </p>
      </div>

      <div className="flex-1 w-full min-h-0 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 12, right: 8, left: 14, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              horizontal={false}
              stroke="var(--color-border)"
            />
            <XAxis
              type="number"
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={110}
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
              cursor={{ fill: "var(--color-muted)", opacity: 0.15 }}
            />
            <Bar
              dataKey="attempts"
              fill="var(--color-chart-2)"
              radius={[0, 8, 8, 0]}
              maxBarSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default TopLecturesChart;
