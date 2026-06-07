import React from "react";
import * as Lucide from "lucide-react";

interface EmptyStateProps {
  icon?: keyof typeof Lucide;
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "Inbox",
  title,
  description,
}) => {
  const IconComponent = Lucide[icon] as React.ComponentType<any>;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border border-dashed border-border bg-card/50 select-none">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
        {IconComponent && <IconComponent className="h-6 w-6" />}
      </div>
      <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-[280px]">
        {description}
      </p>
    </div>
  );
};
export default EmptyState;
