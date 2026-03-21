import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
          <div className="max-w-md w-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-destructive" size={32} />
            </div>
            <h1 className="text-xl font-black text-white mb-2">Something went wrong</h1>
            <p className="text-white/60 text-sm mb-6">
              {this.state.error.message || "An unexpected error occurred. Please try again."}
            </p>
            <Button
              onClick={this.handleRetry}
              className="bg-[#14b5d9] hover:bg-[#14b5d9]/80 text-black font-bold"
            >
              <RefreshCw size={16} className="mr-2" />
              Reload app
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
