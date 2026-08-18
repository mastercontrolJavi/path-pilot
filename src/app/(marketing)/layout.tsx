import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PathPilotLogo } from "@/components/ui/logo";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="group/site-header sticky top-0 z-50 border-b bg-[#faf7f2]/88 backdrop-blur-md">
        <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto] items-center px-4 sm:h-[72px] sm:px-6 md:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            className="flex w-fit items-center"
            aria-label="PathPilot home"
          >
            <PathPilotLogo className="text-foreground" />
          </Link>
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-7 md:flex"
          >
            <Link href="/#how" className="header-route-link">
              How it works
            </Link>
            <span className="size-1 rounded-full bg-primary/30" />
            <Link href="/#destination" className="header-route-link">
              What you get
            </Link>
            <span className="size-1 rounded-full bg-primary" />
            <Link href="/demo" className="header-route-link">
              Sample report
            </Link>
          </nav>
          <nav
            aria-label="Account navigation"
            className="flex items-center justify-end gap-2 sm:gap-4"
          >
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:-translate-y-0.5 hover:bg-[#173d2e] sm:px-5"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:-translate-y-0.5 hover:bg-[#173d2e] sm:px-5"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
        <nav
          aria-label="Mobile navigation"
          className="flex h-11 items-center justify-center gap-6 overflow-x-auto border-t px-4 md:hidden"
        >
          <Link
            href="/#how"
            className="inline-flex h-11 shrink-0 items-center text-xs font-medium text-muted-foreground"
          >
            How it works
          </Link>
          <Link
            href="/#destination"
            className="inline-flex h-11 shrink-0 items-center text-xs font-medium text-muted-foreground"
          >
            What you get
          </Link>
          <Link
            href="/demo"
            className="inline-flex h-11 shrink-0 items-center text-xs font-medium text-muted-foreground"
          >
            Sample report
          </Link>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-[#f3eee6]">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="max-w-sm">
              <PathPilotLogo className="text-foreground mb-3" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Career direction, not just applications. PathPilot is an
                independent project built by{" "}
                <a
                  href="https://pathpilot.javiertpadilla.com"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Javier Padilla
                </a>
                .
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="font-medium text-foreground mb-2.5">Product</p>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/demo"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Sample analysis
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/signup"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Get started
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2.5">Legal</p>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/privacy"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <a
                      href="mailto:jvra0102@gmail.com"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border/30 text-xs text-muted-foreground">
            © {new Date().getFullYear()} PathPilot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
