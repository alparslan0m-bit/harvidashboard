import React from "react";
import { cn } from "../../lib/utils";

interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border/60 p-4 rounded-xl shadow-sm select-none transition-all duration-200",
        className
      )}
    >
      {children}
    </div>
  );
};

export default FilterBar;
