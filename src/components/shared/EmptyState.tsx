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
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border bg-muted/20">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-foreground/60 mb-4 select-none">
        {IconComponent && <IconComponent className="h-8 w-8" />}
      </div>
      <h3 className="text-base font-bold text-foreground tracking-tight font-heading">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-[320px] leading-relaxed">
        {description}
      </p>
    </div>
  );
};
export default EmptyState;
