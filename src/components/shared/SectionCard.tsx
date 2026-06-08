import React from "react";
import { cn } from "../../lib/utils";

interface SectionCardProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  actions,
  children,
  className,
}) => {
  return (
    <section
      className={cn(
        "rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200",
        className
      )}
    >
      {(title || description || actions) && (
        <div className="flex items-start justify-between gap-4 mb-4 select-none">
          <div className="space-y-0.5">
            {title && (
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-[11px] text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="w-full">{children}</div>
    </section>
  );
};

export default SectionCard;
