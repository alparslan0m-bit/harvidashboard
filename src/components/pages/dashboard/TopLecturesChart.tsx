import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "../../shared/ChartCard";

interface TopLecturesChartProps {
  data: { name: string; attempts: number }[];
}

export const TopLecturesChart: React.FC<TopLecturesChartProps> = ({ data }) => {
  return (
    <ChartCard
      title="Top 5 Lectures by Attempts"
      description="Most popular lectures by total student completions"
      data={data}
      filename="top_lectures"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 12, right: 30, left: 10, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="4 4"
            horizontal={false}
            stroke="var(--color-border)"
          />
          <XAxis
            type="number"
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 13 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 13 }}
            tickLine={false}
            axisLine={false}
            width={140}
            tickFormatter={(val) => (val.length > 18 ? `${val.substring(0, 18)}...` : val)}
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
            cursor={{ fill: "var(--color-muted)", opacity: 0.15 }}
          />
          <Bar
            dataKey="attempts"
            fill="var(--color-chart-2)"
            radius={[0, 4, 4, 0]}
            maxBarSize={28}
          >
            <LabelList
              dataKey="attempts"
              position="right"
              fill="var(--color-muted-foreground)"
              fontSize={12}
              fontWeight={600}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TopLecturesChart;
