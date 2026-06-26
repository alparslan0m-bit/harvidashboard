import React from "react";
import { cn } from "../../lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description: _description,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        "relative -mx-4 -mt-4 mb-6 sm:-mx-5 sm:-mt-5 lg:-mx-6 lg:-mt-6 px-4 py-8 sm:px-5 sm:py-10 lg:px-6 lg:py-12 border-b border-border bg-card overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 z-0 bg-vercel-mesh opacity-20 dark:opacity-10 pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
      <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading flex items-center gap-3">
            {title}
          </h1>
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
