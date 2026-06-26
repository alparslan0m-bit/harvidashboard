import React from "react";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ChartCard } from "@/components/shared/ChartCard";
import { EmptyChart } from "@/components/shared/EmptyChart";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];
const tooltipStyle = {
  backgroundColor: "var(--color-card)",
  borderColor: "var(--color-border)",
  fontSize: "13px",
  borderRadius: "var(--radius)",
};

interface AnalyticsChartsGridProps {
  dailyActiveUsers?: { name: string; count: number }[];
  purchaseBreakdown?: { name: string; value: number }[];
}

export const AnalyticsChartsGrid: React.FC<AnalyticsChartsGridProps> = ({
  dailyActiveUsers,
  purchaseBreakdown,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 select-none">
    <ChartCard title="Daily Active Users" description="Chronological student login counts" data={dailyActiveUsers} filename="daily_active_users">
      {!dailyActiveUsers?.length ? (
        <EmptyChart description="No quiz activity recorded in this period" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyActiveUsers} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="count" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
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
            <Legend wrapperStyle={{ fontSize: "12px" }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  </div>
);
