'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, RefreshCcw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 px-4">
      <div className="mx-auto max-w-2xl text-center">
        {/* Error Icon */}
        <div className="relative mb-8">
          <div className="text-[120px] font-bold leading-none text-muted-foreground/20 md:text-[180px]">
            500
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse rounded-full bg-destructive/10 p-8">
              <AlertTriangle className="h-16 w-16 text-destructive md:h-24 md:w-24" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          Something Went Wrong
        </h1>

        {/* Description */}
        <p className="mb-8 text-lg text-muted-foreground md:text-xl">
          We encountered an unexpected error. Don't worry, our team has been notified and is working on it.
        </p>

        {/* Error Details (in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-left">
            <p className="mb-2 text-sm font-semibold text-destructive">
              Error Details (Development Only):
            </p>
            <code className="block overflow-x-auto text-xs text-muted-foreground">
              {error.message}
            </code>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            onClick={() => reset()}
            className="gap-2 w-full sm:w-auto"
          >
            <RefreshCcw className="h-5 w-5" />
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 w-full sm:w-auto"
            >
              <Home className="h-5 w-5" />
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-12 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            What You Can Do
          </h2>
          <div className="grid gap-3 text-sm text-left">
            <div className="flex items-start gap-3 rounded-md p-3 hover:bg-muted">
              <span className="text-2xl">🔄</span>
              <div>
                <p className="font-medium">Refresh the page</p>
                <p className="text-muted-foreground">Sometimes a simple refresh can fix the issue</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md p-3 hover:bg-muted">
              <span className="text-2xl">🏠</span>
              <div>
                <p className="font-medium">Go back to dashboard</p>
                <p className="text-muted-foreground">Start fresh from your main dashboard</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md p-3 hover:bg-muted">
              <span className="text-2xl">💾</span>
              <div>
                <p className="font-medium">Check your connection</p>
                <p className="text-muted-foreground">Make sure you're connected to the internet</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md p-3 hover:bg-muted">
              <span className="text-2xl">📧</span>
              <div>
                <p className="font-medium">Contact support</p>
                <p className="text-muted-foreground">If the problem persists, reach out to our team</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-sm text-muted-foreground">
          Error persisting?{' '}
          <Link href="/dashboard/settings" className="text-primary hover:underline">
            Check your settings
          </Link>
          {' '}or try clearing your browser cache.
        </p>
      </div>
    </div>
  );
}
