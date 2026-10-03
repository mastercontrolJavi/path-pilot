import Link from "next/link";
import { formatDate } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button-variants";
import { NodeDot } from "@/components/pp/waypoint";
import { EmptyState } from "@/components/pp/states";
import { cn } from "@/lib/utils";
import { PlanProgress } from "./plan-progress";

export type JourneyEntry = {
  id: string;
  createdAt: string;
  kind: "ready" | "building" | "stopped";
  title: string;
  fit: number | null;
  steps: number;
};

/**
 * The dashboard: past routes as a log along one thin Route, newest first.
 * The newest finished route is "you are here".
 */
export function JourneyLog({ entries }: { entries: JourneyEntry[] }) {
  if (entries.length === 0) {
    return (
      <>
        <h1 className="sr-only">Your journey</h1>
        <EmptyState
          title="Your first route starts with your CV"
          description="Upload it and answer a few questions. You'll get roles you already fit, what they typically pay, the skills to build and a seven-day plan."
          action={
            <Link href="/new" className={buttonVariants({ size: "lg" })}>
              Start a new route
            </Link>
          }
          className="py-16"
        />
      </>
    );
  }

  const latestReady = entries.findIndex((e) => e.kind === "ready");

  return (
    <div className="max-w-[46rem]">
      <div className="flex flex-wrap items-end justify-between gap-6 pb-12">
        <div>
          <h1 className="font-display text-2xl font-[400] tracking-[-0.01em] text-ink md:text-3xl">Your journey</h1>
          <p className="mt-2 text-base text-ink-muted">
            {entries.length === 1 ? "One route so far." : `${entries.length} routes so far.`} Each starts from the CV and
            answers you gave at the time.
          </p>
        </div>
        <Link href="/new" className={buttonVariants({ size: "lg" })}>
          Start a new route
        </Link>
      </div>

      <ol aria-label="Your routes, newest first">
        {entries.map((e, i) => {
          const last = i === entries.length - 1;
          const state = e.kind !== "ready" ? "upcoming" : i === latestReady ? "current" : "done";
          return (
            <li key={e.id} className="relative grid grid-cols-[22px_minmax(0,1fr)] gap-x-5">
              {!last && (
                <span aria-hidden className="absolute top-8 bottom-1 left-[10.25px] w-[1.5px] rounded-full bg-contour" />
              )}
              <span className="relative z-10 mt-1">
                <NodeDot state={state} size={22} />
              </span>
              <Link href={`/analysis/${e.id}`} className={cn("group block rounded-control", !last && "pb-10")}>
                <time dateTime={e.createdAt} className="font-mono text-sm text-ink-faint">
                  {formatDate(e.createdAt)}
                </time>
                <p
                  className={cn(
                    "mt-1 font-display text-xl font-[420] tracking-[-0.01em] decoration-forest/40 underline-offset-4 group-hover:underline md:text-2xl",
                    e.kind === "ready" ? "text-ink" : "text-ink-muted"
                  )}
                >
                  {e.title}
                </p>
                <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted">
                  {e.kind === "ready" && (
                    <>
                      <span>
                        <span className="font-mono text-ink">{e.fit}%</span> match
                      </span>
                      <PlanProgress analysisId={e.id} total={e.steps} />
                    </>
                  )}
                  {e.kind === "building" && <span>Still working. Open it to follow along.</span>}
                  {e.kind === "stopped" && <span>Open it to try again with the same CV and answers.</span>}
                </p>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
