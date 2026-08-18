import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { PathPilotLogo } from "@/components/ui/logo";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const h = await headers();
    const pathname = h.get("x-pathname") ?? "/dashboard";
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-[#faf7f2]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center">
              <PathPilotLogo className="text-foreground" />
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                Journey log
              </Link>
              <Link
                href="/new"
                className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                New journey
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {displayName}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 pb-24 sm:px-6 sm:py-12 sm:pb-12">
        {children}
      </main>
      <nav
        aria-label="App navigation"
        className="mobile-safe-bottom fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 border-t bg-background px-3 pt-2 shadow-[0_-8px_24px_rgba(28,25,23,0.08)] sm:hidden"
      >
        <Link
          href="/dashboard"
          className="flex min-h-12 items-center justify-center rounded-xl text-sm font-medium text-muted-foreground active:bg-accent"
        >
          Journey log
        </Link>
        <Link
          href="/new"
          className="flex min-h-12 items-center justify-center rounded-xl bg-primary text-sm font-medium text-white"
        >
          New journey
        </Link>
      </nav>
    </div>
  );
}
