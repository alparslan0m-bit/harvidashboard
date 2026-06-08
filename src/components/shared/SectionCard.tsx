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
  const isFlush = className?.includes("p-0");

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/15 overflow-hidden",
        className
      )}
    >
      {(title || description || actions) && (
        <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border bg-secondary/60">
          <div className="space-y-0.5 min-w-0">
            {title && (
              <h2 className="text-lg font-bold tracking-tight text-foreground font-heading">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground leading-snug">
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
      <div className={cn("w-full flex-1 min-h-0 flex flex-col", !isFlush && "p-4")}>{children}</div>
    </section>
  );
};

export default SectionCard;
