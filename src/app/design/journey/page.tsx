import Link from "next/link";
import { AppHeader } from "@/components/app/app-header";
import { JourneyLog, type JourneyEntry } from "@/components/app/journey-log";
import { ErrorPreview } from "./error-preview";

export const metadata = { title: "Dashboard preview - PathPilot" };

const ENTRIES: JourneyEntry[] = [
  { id: "design-sample", createdAt: "2026-10-02T09:30:00.000Z", kind: "ready", title: "Product operations manager", fit: 87, steps: 7 },
  { id: "p2", createdAt: "2026-09-28T16:05:00.000Z", kind: "stopped", title: "This route didn't finish", fit: null, steps: 0 },
  { id: "p3", createdAt: "2026-09-14T11:20:00.000Z", kind: "ready", title: "Customer success manager", fit: 81, steps: 7 },
  { id: "p4", createdAt: "2026-08-30T08:45:00.000Z", kind: "ready", title: "Implementation specialist", fit: 78, steps: 7 },
];

/** Internal: the app header and journey log with fixture entries (local and preview deploys only). */
export default async function JourneyPreview({ searchParams }: { searchParams: Promise<{ empty?: string; error?: string }> }) {
  const { empty, error } = await searchParams;
  return (
    <div className="min-h-screen bg-paper">
      <AppHeader name="Maya Chen" email="maya@example.com" />
      <main id="main" className="mx-auto w-full max-w-6xl px-6 py-8">
        <p className="mb-8 text-sm text-ink-muted">
          Preview:{" "}
          <Link href="/design/journey" className="text-forest underline underline-offset-4">
            with routes
          </Link>{" "}
          ·{" "}
          <Link href="/design/journey?empty=1" className="text-forest underline underline-offset-4">
            empty
          </Link>{" "}
          ·{" "}
          <Link href="/design/journey?error=1" className="text-forest underline underline-offset-4">
            error
          </Link>
        </p>
        {error ? <ErrorPreview /> : <JourneyLog entries={empty ? [] : ENTRIES} />}
      </main>
    </div>
  );
}
