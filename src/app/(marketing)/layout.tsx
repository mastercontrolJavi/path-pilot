import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/user";
import { PathPilotLogo } from "@/components/ui/logo";
import { buttonVariants } from "@/components/ui/button-variants";
import { TrackClicks } from "@/components/landing/track-clicks";
import { cn } from "@/lib/utils";
import { CONTACT_EMAIL } from "@/config/site";

const navLink =
  "inline-flex min-h-11 items-center px-1 text-sm font-medium text-ink-muted transition-colors duration-[180ms] hover:text-ink";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-[60] rounded-control bg-sheet px-4 py-2 text-sm font-medium text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <header className="pp-nav sticky top-0 z-50 bg-paper">
        <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center rounded-control text-ink">
            <PathPilotLogo className="hidden sm:block" />
            <PathPilotLogo compact className="sm:hidden" />
          </Link>
          <nav aria-label="Main" className="flex items-center gap-3 sm:gap-6">
            <Link href="/#how" className={cn(navLink, "hidden md:inline-flex")}>
              How it works
            </Link>
            <Link href="/#sample" className={cn(navLink, "hidden md:inline-flex")}>
              Sample report
            </Link>
            {user ? (
              <Link href="/dashboard" className={navLink}>
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className={navLink}>
                Sign in
              </Link>
            )}
            {/* Secondary on purpose: the hero and final CTAs are the page's primary actions. */}
            <Link
              href={user ? "/new" : "/signup"}
              className={buttonVariants({ variant: "secondary", size: "sm" })}
              data-track="landing_cta_clicked"
              data-track-location="nav"
            >
              Map my next move
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-contour">
        <div className="mx-auto flex max-w-page flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <PathPilotLogo className="text-ink" />
            <p className="mt-3 text-sm text-ink-muted">
              An independent project built by{" "}
              <a
                href="https://pathpilot.javiertpadilla.com"
                className="text-ink underline decoration-contour underline-offset-4 hover:decoration-ink"
              >
                Javier Padilla
              </a>
              .
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <li>
                <Link href="/demo" className={navLink}>
                  Sample report
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={navLink}>
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={navLink}>
                  Terms
                </Link>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className={navLink}>
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mx-auto max-w-page px-4 pb-10 text-xs text-ink-faint sm:px-6">
          © {new Date().getFullYear()} PathPilot
        </div>
      </footer>
      <TrackClicks />
    </div>
  );
}
