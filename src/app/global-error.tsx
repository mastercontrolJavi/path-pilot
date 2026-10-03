"use client";

import "./globals.css";
import { fraunces, fragmentMono, generalSans } from "./fonts";

/** Last resort when the root layout itself fails: no app chrome, same voice. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${fragmentMono.variable} ${generalSans.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink">
        <main className="mx-auto flex min-h-screen max-w-page flex-col justify-center px-4 py-16 sm:px-6">
          <h1 className="font-display text-3xl font-[400] tracking-[-0.02em] text-ink">PathPilot didn&apos;t load</h1>
          <p className="mt-4 max-w-[52ch] text-lg text-ink-muted">
            Something went wrong on our side. Try again in a moment. Your routes and answers are safe.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-12 cursor-pointer items-center rounded-control bg-forest px-5 text-base font-medium text-sheet hover:bg-forest-deep"
            >
              Try again
            </button>
            {/* A full page load, since the app shell itself failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="inline-flex h-12 items-center rounded-control border border-contour bg-sheet px-5 text-base font-medium text-ink">
              Back to the home page
            </a>
          </div>
          {error.digest && (
            <p className="mt-6 text-xs text-ink-faint">
              Reference for support: <span className="font-mono text-ink-muted">{error.digest}</span>
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
