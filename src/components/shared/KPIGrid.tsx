import React from "react";
import { MetricCard } from "./MetricCard";
import { cn } from "../../lib/utils";

interface KPICardConfig {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string } | null;
  className?: string;
}

interface KPIGridProps {
  cards: KPICardConfig[];
  className?: string;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ cards, className }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5",
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
          className={card.className}
        />
      ))}
    </div>
  );
};

export default KPIGrid;
