import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  /** Shown in the fallback so the user knows which module failed */
  moduleName: string;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Contains a crash to the module that caused it, so one failing tab
 * never blanks the whole application.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[AfriProcure] ${this.props.moduleName} crashed`, error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div role="alert" className="bg-white border border-red-200 rounded-2xl p-6 sm:p-8 shadow-xs max-w-2xl mx-auto mt-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h2 className="text-base font-bold text-stone-900">{this.props.moduleName} could not be displayed</h2>
            <p className="text-sm text-stone-600">
              An unexpected error occurred in this module. Your other modules and saved data are unaffected.
            </p>
            <pre className="text-xs font-mono bg-stone-50 border border-stone-200 rounded-lg p-3 text-red-700 whitespace-pre-wrap break-words">
              {this.state.error.message}
            </pre>
            <button
              onClick={() => this.setState({ error: null })}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-stone-900 hover:bg-stone-800 text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              Retry module
            </button>
          </div>
        </div>
      </div>
    );
  }
}
