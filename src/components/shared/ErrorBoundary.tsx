import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-card border border-destructive/20 rounded-xl max-w-lg mx-auto mt-12 text-center select-none">
          <div className="h-10 w-10 text-destructive bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            {this.props.fallbackMessage || "Something went wrong"}
          </h2>
          <p className="mt-2 text-xs text-muted-foreground max-w-md break-words">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          {this.state.error?.stack && (
            <pre className="mt-3 p-3 bg-muted rounded text-[10px] text-left text-muted-foreground max-w-md max-h-40 overflow-auto w-full">
              {this.state.error.stack}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-xs font-semibold border rounded-md hover:bg-accent hover:text-accent-foreground transition"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
