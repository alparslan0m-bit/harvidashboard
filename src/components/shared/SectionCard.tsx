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
        "rounded-[8px] border border-border bg-card overflow-hidden",
        className
      )}
    >
      {(title || description || actions) && (
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
          <div className="space-y-1 min-w-0">
            {title && (
              <h2 className="text-sm font-semibold tracking-tight text-foreground font-heading">
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
      <div className={cn("w-full flex-1 min-h-0 flex flex-col gap-0", !isFlush && "p-4")}>{children}</div>
    </section>
  );
};

export default SectionCard;
