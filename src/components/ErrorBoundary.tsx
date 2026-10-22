import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('Unhandled UI exception caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1120] text-[#F9FAFB] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#111827] border border-white/[0.08] rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="font-cinzel text-xl font-bold text-white">Something Went Wrong</h2>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              An unexpected display issue occurred. Your accounting and prayer records are safe in local storage.
            </p>
            {this.state.error?.message && (
              <div className="p-3 bg-black/40 rounded-xl text-left border border-white/[0.04]">
                <p className="text-[11px] font-mono text-rose-300 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#10B981] text-xs font-bold text-white hover:brightness-110 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
