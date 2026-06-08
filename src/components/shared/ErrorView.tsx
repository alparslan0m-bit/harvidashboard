import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";

interface ErrorViewProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  message,
  title = "An error occurred",
  onRetry,
  retryText = "Retry Loading",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 bg-card border border-destructive/20 rounded-xl max-w-md mx-auto text-center select-none shadow-sm",
        className
      )}
    >
      <div className="h-10 w-10 text-destructive bg-destructive/10 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-1.5 text-xs text-muted-foreground max-w-xs break-words">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 px-4 py-2 text-xs font-semibold border rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200"
        >
          <RefreshCw className="h-3 w-3" />
          <span>{retryText}</span>
        </button>
      )}
    </div>
  );
};

export default ErrorView;
