import Link from "next/link";
import { Suspense } from "react";
import { PathPilotLogo } from "@/components/ui/logo";
import { Route } from "@/components/pp/route";
import { OfflineBanner } from "@/components/pp/offline-banner";

// A route already under way: done waypoints, "you are here", and the road ahead.
const POINTS = [
  { x: 70, y: 610 },
  { x: 170, y: 560 },
  { x: 230, y: 455 },
  { x: 360, y: 400 },
  { x: 430, y: 270 },
  { x: 540, y: 150 },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[480px_minmax(0,1fr)]">
      <div className="flex min-h-screen flex-col px-4 py-8 sm:px-10 lg:border-r lg:border-contour lg:bg-sheet">
        <header>
          <Link href="/" className="block w-fit rounded-control text-ink" aria-label="PathPilot home">
            <PathPilotLogo />
          </Link>
        </header>
        <main id="main" className="flex flex-1 flex-col justify-center py-12">
          <div className="mx-auto w-full max-w-sm">
            <Suspense>{children}</Suspense>
          </div>
        </main>
        <nav aria-label="Legal" className="flex gap-6 text-sm text-ink-muted">
          <Link href="/privacy" className="rounded-control hover:text-ink">
            Privacy
          </Link>
          <Link href="/terms" className="rounded-control hover:text-ink">
            Terms
          </Link>
        </nav>
      </div>

      <div aria-hidden className="relative hidden items-center justify-center overflow-hidden lg:flex">
        <Route
          variant="map"
          width={600}
          height={700}
          points={POINTS}
          activeIndex={3}
          track
          stateOf={(i) => (i < 3 ? "done" : i === 3 ? "current" : i === POINTS.length - 1 ? "destination" : "upcoming")}
          className="h-auto w-full max-w-[560px] px-10"
        />
        <p className="absolute bottom-12 left-12 font-display text-2xl font-[400] text-ink-muted">
          Your route starts here.
        </p>
      </div>
      <OfflineBanner />
    </div>
  );
}
