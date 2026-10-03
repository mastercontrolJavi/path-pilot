import { buttonVariants } from "@/components/ui/button-variants";
import { PathPilotLogo } from "@/components/ui/logo";

export const metadata = { title: "Page not found - PathPilot" };

// Plain <a> links: a full page load out of a 404 is fine, and this page then ships no client JS
// (it is loaded on every route as the root not-found boundary).
/* eslint-disable @next/next/no-html-link-for-pages */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-page flex-col px-4 py-8 sm:px-6">
      <header>
        <a href="/" aria-label="PathPilot home" className="block w-fit rounded-control text-ink">
          <PathPilotLogo />
        </a>
      </header>
      <main id="main" className="flex flex-1 flex-col justify-center py-16">
        {/* A route that runs out: drawn, then dashed into nothing. */}
        <svg width="160" height="40" viewBox="0 0 160 40" aria-hidden className="overflow-visible">
          <path d="M8 30 C 30 30, 40 10, 70 12" fill="none" stroke="var(--color-forest)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M70 12 C 95 14, 110 26, 150 22" fill="none" stroke="var(--color-contour)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 6" />
          <circle cx="8" cy="30" r="5" fill="var(--color-moss)" stroke="var(--color-forest)" strokeWidth="1.5" />
        </svg>
        <h1 className="mt-8 max-w-[18ch] font-display text-3xl font-[400] tracking-[-0.02em] text-ink">
          This path doesn&apos;t go anywhere
        </h1>
        <p className="mt-4 max-w-[52ch] text-lg text-ink-muted">
          The page may have moved, or the link has a typo. Your routes are safe in your dashboard.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/dashboard" className={buttonVariants({ size: "lg" })}>
            Go to your dashboard
          </a>
          <a href="/" className={buttonVariants({ variant: "secondary", size: "lg" })}>
            Back to the home page
          </a>
        </div>
      </main>
    </div>
  );
}
