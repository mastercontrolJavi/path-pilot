"use client";

import { lazy, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PathPilotLogo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

// The menu, dialog and Supabase sign-out are ~35KB; they load right after first paint.
const AccountMenu = lazy(() => import("./account-menu"));

const navLink =
  "inline-flex min-h-11 items-center rounded-control px-2.5 text-sm font-medium transition-colors duration-[180ms] hover:text-ink";

// Same look as the real trigger, so nothing shifts when the menu arrives.
const avatarPlaceholder =
  "grid size-10 shrink-0 place-items-center rounded-full border border-contour bg-moss/50 text-sm font-medium text-ink pointer-coarse:size-11";

/** App chrome: where you are, start a new route, and the account menu. */
export function AppHeader({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("") || "?";

  const link = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link href={href} aria-current={active ? "page" : undefined} className={cn(navLink, active ? "text-ink" : "text-ink-muted")}>
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-contour bg-paper print:hidden">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-4 sm:gap-8">
          <Link href="/dashboard" aria-label="PathPilot: your journey" className="rounded-control text-ink">
            <PathPilotLogo className="hidden sm:block" />
            <PathPilotLogo compact className="sm:hidden" />
          </Link>
          <nav aria-label="App" className="flex items-center">
            {link("/dashboard", "Dashboard")}
            {link("/new", "New route")}
          </nav>
        </div>

        <Suspense
          fallback={
            <span aria-hidden className={avatarPlaceholder}>
              {initials}
            </span>
          }
        >
          <AccountMenu name={name} email={email} initials={initials} />
        </Suspense>
      </div>
    </header>
  );
}
