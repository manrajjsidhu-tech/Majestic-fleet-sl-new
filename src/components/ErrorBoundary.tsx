import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[MAJESTIC] Uncaught React Error Boundary caught error:", error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-neutral-900 border border-amber-500/30 rounded-2xl p-8 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-xl font-black">
              !
            </div>
            <h2 className="text-lg font-bold font-mono tracking-wide text-amber-400 uppercase">
              Application Recovered
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              A temporary interface state occurred. Click below to refresh and continue using Majestic Fleet.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
