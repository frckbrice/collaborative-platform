'use client';

import React, { ErrorInfo, ReactNode, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export function GracefullyDegradingErrorBoundary({ children, onError }: ErrorBoundaryProps) {
  const [state, setState] = useState<ErrorBoundaryState>({ hasError: false });
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleError = (error: Error, errorInfo: ErrorInfo) => {
      console.error('Error boundary caught error:', error);
      console.error('Error boundary error details:', { error, errorInfo });
      setState({ hasError: true, error });

      if (onError) {
        onError(error, errorInfo);
      }
    };

    // Add global error handler
    const originalErrorHandler = window.onerror;
    const originalUnhandledRejectionHandler = window.onunhandledrejection;

    window.onerror = (message, source, lineno, colno, error) => {
      if (error) {
        handleError(error, { componentStack: '' });
      }
      if (originalErrorHandler) {
        return originalErrorHandler(message, source, lineno, colno, error);
      }
    };

    window.onunhandledrejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      handleError(error, { componentStack: '' });
      if (originalUnhandledRejectionHandler) {
        return originalUnhandledRejectionHandler.call(window, event);
      }
    };

    return () => {
      window.onerror = originalErrorHandler;
      window.onunhandledrejection = originalUnhandledRejectionHandler;
    };
  }, [onError]);

  if (state.hasError) {
    return (
      <div className="flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md">
            {state.error?.message || 'An unexpected error occurred while loading the dashboard.'}
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => {
                setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/dashboard')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <div ref={contentRef}>{children}</div>;
}

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('Dashboard error:', error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Dashboard Error</h1>
        <p className="text-muted-foreground max-w-md">
          {error.message || 'An error occurred while loading the dashboard.'}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/login')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
