'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4">
      <div className="mx-auto max-w-2xl text-center">
        {/* 404 Animation */}
        <div className="relative mb-8">
          <div className="text-[120px] font-bold leading-none text-muted-foreground/20 md:text-[180px]">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-primary/10 p-8">
              <Search className="h-16 w-16 text-primary md:h-24 md:w-24" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="mb-8 text-lg text-muted-foreground md:text-xl">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Home className="h-5 w-5" />
              Go to Dashboard
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.history.back()}
            className="gap-2 w-full sm:w-auto"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Quick Links
          </h2>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <Link
              href="/dashboard/invoices"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted"
            >
              <span className="text-lg">📄</span>
              <span>View Invoices</span>
            </Link>
            <Link
              href="/dashboard/payments"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted"
            >
              <span className="text-lg">💳</span>
              <span>View Payments</span>
            </Link>
            <Link
              href="/dashboard/clients"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted"
            >
              <span className="text-lg">👥</span>
              <span>View Clients</span>
            </Link>
            <Link
              href="/dashboard/expenses"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted"
            >
              <span className="text-lg">🧾</span>
              <span>View Expenses</span>
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-sm text-muted-foreground">
          Need help? Contact support or check our{' '}
          <Link href="/dashboard/settings" className="text-primary hover:underline">
            settings
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
