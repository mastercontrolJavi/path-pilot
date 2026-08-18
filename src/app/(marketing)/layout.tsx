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
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <PathPilotLogo className="text-foreground" />
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/50 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
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
                    <Link href="/demo" className="text-muted-foreground hover:text-foreground transition-colors">
                      Sample analysis
                    </Link>
                  </li>
                  <li>
                    <Link href="/signup" className="text-muted-foreground hover:text-foreground transition-colors">
                      Get started
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2.5">Legal</p>
                <ul className="space-y-2">
                  <li>
                    <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
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
