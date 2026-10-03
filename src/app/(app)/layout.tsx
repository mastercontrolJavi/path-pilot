import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/supabase/user";
import { Toaster } from "@/components/ui/sonner";
import { OfflineBanner } from "@/components/pp/offline-banner";
import { AppHeader } from "@/components/app/app-header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Shared with the page (one Supabase call per request).
  const user = await getCurrentUser();

  if (!user) {
    // Signed out or session expired: sign in, then come straight back here.
    const h = await headers();
    const pathname = h.get("x-pathname") ?? "/dashboard";
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "You";

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <a
        href="#main"
        className="sr-only z-[60] rounded-control bg-sheet px-4 py-2 text-sm font-medium text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <AppHeader name={name} email={user.email ?? ""} />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {children}
      </main>
      <Toaster position="bottom-right" />
      <OfflineBanner />
    </div>
  );
}
