'use client';

import { Component, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to your error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // In production, you would send this to Sentry, LogRocket, etc.
    // if (process.env.NODE_ENV === 'production') {
    //   reportError({ error, errorInfo });
    // }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-zinc-600 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left bg-zinc-50 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-zinc-700">
                  Error details
                </summary>
                <pre className="mt-2 text-xs text-red-600 overflow-auto">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                Refresh page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use with hooks
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
