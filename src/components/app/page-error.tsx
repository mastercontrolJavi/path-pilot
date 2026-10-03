"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { ErrorState } from "@/components/pp/states";

/**
 * Error boundary body for the app and auth groups: say so, offer a retry, keep a way home.
 * Not mounted at the root, so the static marketing pages don't ship it (they fall back to global-error).
 */
export function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      titleAs="h1"
      title="This page didn't load"
      description="Something went wrong on our side. Try again, and if it keeps happening, your dashboard still has every route."
      action={
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={reset}>Try again</Button>
            <Link href="/dashboard" className={buttonVariants({ variant: "secondary" })}>
              Go to your dashboard
            </Link>
          </div>
          {error.digest && (
            <p className="text-xs text-ink-faint">
              Reference for support: <span className="font-mono text-ink-muted">{error.digest}</span>
            </p>
          )}
        </div>
      }
    />
  );
}
