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
  featured?: boolean;
}

interface KPIGridProps {
  cards: KPICardConfig[];
  className?: string;
  compact?: boolean;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ cards, className, compact = false }) => {
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
          className={card.className}
          compact={compact}
          featured={card.featured}
        />
      ))}
    </div>
  );
};

export default KPIGrid;
