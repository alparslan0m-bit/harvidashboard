import React from "react";
import { MetricCard, type MetricCardProps } from "./MetricCard";
import { cn } from "../../lib/utils";

export const KPI_COLORS = [
  "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 dark:from-blue-950/40 dark:to-indigo-900/20 dark:border-blue-900/50",
  "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 dark:from-emerald-950/40 dark:to-teal-900/20 dark:border-emerald-900/50",
  "bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100 dark:from-rose-950/40 dark:to-pink-900/20 dark:border-rose-900/50",
  "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 dark:from-amber-950/40 dark:to-orange-900/20 dark:border-amber-900/50",
  "bg-gradient-to-br from-fuchsia-50 to-purple-50 border-fuchsia-100 dark:from-fuchsia-950/40 dark:to-purple-900/20 dark:border-fuchsia-900/50",
  "bg-gradient-to-br from-sky-50 to-cyan-50 border-sky-100 dark:from-sky-950/40 dark:to-cyan-900/20 dark:border-sky-900/50",
];

interface KPIGridProps {
  cards: MetricCardProps[];
  className?: string;
  compact?: boolean;
  colorful?: boolean;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ cards, className, compact = false, colorful = false }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5",
        className
      )}
    >
      {cards.map((card, idx) => (
        <MetricCard
          key={idx}
          title={card.title}
          value={card.value}
          description={card.description}
          icon={card.icon}
          trend={card.trend}
          className={cn(colorful ? KPI_COLORS[idx % KPI_COLORS.length] : "", card.className)}
          compact={compact}
          featured={card.featured}
        />
      ))}
    </div>
  );
};

export default KPIGrid;
