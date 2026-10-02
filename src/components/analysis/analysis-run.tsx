"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Route } from "@/components/pp/route";
import { Waypoint, WaypointList } from "@/components/pp/waypoint";
import { ErrorState } from "@/components/pp/states";
import { MotionRoot } from "@/components/pp/motion-root";
import { useReducedMotion } from "@/lib/motion";
import { track } from "@/lib/analytics";
import { STAGES, stageAt, waitMessage } from "./stages";

export type RunOutcome =
  | { ok: true; analysisId: string }
  | { ok: false; kind: "session" | "upload" | "network" | "unreadable" | "server" | "failed" | "timeout" };

export type StartRun = (hooks: { onSent: () => void }) => Promise<RunOutcome>;

type StatusCheck = (analysisId: string) => Promise<"completed" | "failed" | "processing">;

/** Real status check: the analysis row decides whether the report exists. */
export const checkStatus: StatusCheck = async (id) => {
  const res = await fetch(`/api/analyze/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(String(res.status));
  const body = (await res.json()) as { status?: string };
  if (body.status === "completed" || body.status === "failed") return body.status;
  return "processing";
};

const FAILURE: Record<Exclude<RunOutcome, { ok: true }>["kind"], { title: string; body: string }> = {
  failed: {
    title: "The analysis didn't finish",
    body: "This is usually temporary. Your CV and answers are kept, so trying again takes one click.",
  },
  server: {
    title: "The analysis didn't start",
    body: "Try again in a moment. Your CV and answers are kept.",
  },
  timeout: {
    title: "This analysis stopped before it finished",
    body: "Try again: it reuses the CV and answers you already gave.",
  },
  network: {
    title: "We lost the connection",
    body: "Check your connection, then try again. Nothing has been lost.",
  },
  upload: {
    title: "Your CV didn't upload",
    body: "Check your connection, then try again. Your file and answers are still here.",
  },
  session: {
    title: "You've been signed out",
    body: "Sign in again and you'll come straight back. Your answers are saved on this device.",
  },
  unreadable: {
    title: "We couldn't read text in that PDF",
    body: "It may be a scanned image. Export it as a text PDF, or paste your CV text instead.",
  },
};

const ROUTE_W = 840;
const POINTS = [...STAGES, "Your route"].map((_, i, all) => ({
  x: 20 + (i * (ROUTE_W - 40)) / (all.length - 1),
  y: i % 2 === 0 ? 46 : 28,
}));

/**
 * Runs an analysis and shows it as a survey: the Route draws stage by stage.
 * Pass `sentAlready` when there is nothing to upload (retries).
 */
export function AnalysisRun({
  start,
  sentAlready = false,
  status = checkStatus,
  onFinished,
  onUnreadable,
  secondary,
  initialSeconds = 0,
  signInRedirect = "/new",
}: {
  start: StartRun;
  sentAlready?: boolean;
  status?: StatusCheck;
  onFinished: (analysisId: string) => void;
  onUnreadable?: () => void;
  secondary?: { label: string; onClick: () => void };
  /** Seconds already elapsed (when resuming an analysis that's in progress). */
  initialSeconds?: number;
  /** Where to come back to after signing in again. */
  signInRedirect?: string;
}) {
  const reduced = useReducedMotion();
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<"running" | "done" | "failed">("running");
  const [failure, setFailure] = useState<Exclude<RunOutcome, { ok: true }>["kind"] | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now() - initialSeconds * 1000);
  const [sentAt, setSentAt] = useState<number | null>(() => (sentAlready ? Date.now() - initialSeconds * 1000 : null));
  const [now, setNow] = useState(() => Date.now());
  const ran = useRef(-1);

  // Tick once a second while running (drives the stage curve and wait messages).
  useEffect(() => {
    if (phase !== "running") return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  // One run per attempt (the ref also guards against Strict Mode re-running effects).
  useEffect(() => {
    if (ran.current === attempt) return;
    ran.current = attempt;
    let cancelled = false;
    const t0 = Date.now();

    (async () => {
      let outcome: RunOutcome;
      try {
        outcome = await start({ onSent: () => !cancelled && setSentAt(Date.now()) });
      } catch {
        outcome = { ok: false, kind: "network" };
      }
      if (outcome.ok) {
        try {
          let result = await status(outcome.analysisId);
          // The request is synchronous today, so this rarely loops; it covers a slow write.
          for (let i = 0; result === "processing" && i < 100; i++) {
            await new Promise((r) => setTimeout(r, 3000));
            result = await status(outcome.analysisId);
          }
          outcome = result === "completed" ? outcome : { ok: false, kind: result === "failed" ? "failed" : "timeout" };
        } catch {
          // Can't confirm: let the results page show whatever state the analysis is in.
        }
      }
      if (cancelled) return;

      if (outcome.ok) {
        track("analysis_completed", { duration_ms: Date.now() - t0 });
        setPhase("done");
        const id = outcome.analysisId;
        window.setTimeout(() => onFinished(id), reduced ? 300 : 900);
        return;
      }
      track("analysis_failed", { reason: outcome.kind });
      if (outcome.kind === "unreadable" && onUnreadable) {
        onUnreadable();
        return;
      }
      setFailure(outcome.kind);
      setPhase("failed");
    })();

    return () => {
      cancelled = true;
    };
    // `start`, `status` and callbacks are stable for the life of a run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  function retry() {
    setFailure(null);
    setPhase("running");
    setStartedAt(Date.now());
    setSentAt(sentAlready ? Date.now() : null);
    setNow(Date.now());
    setAttempt((a) => a + 1);
  }

  const total = Math.max(0, (now - startedAt) / 1000);
  const stage = phase === "done" ? STAGES.length : stageAt(sentAt === null ? null : Math.max(0, (now - sentAt) / 1000));
  const heading = phase === "done" ? "Your route is ready." : "Building your route";
  const status_ = phase === "done" ? "Opening your report." : `${STAGES[Math.min(stage, STAGES.length - 1)]}.`;
  const wait = phase === "running" ? waitMessage(total) : null;

  let failureBlock: ReactNode = null;
  if (phase === "failed" && failure) {
    const copy = FAILURE[failure];
    failureBlock = (
      <ErrorState
        title={copy.title}
        description={copy.body}
        action={
          <div className="flex flex-wrap gap-3">
            {failure === "session" ? (
              <Link href={`/login?redirect=${encodeURIComponent(signInRedirect)}`} className={buttonVariants()}>
                Sign in again
              </Link>
            ) : (
              <Button onClick={retry}>Try again</Button>
            )}
            {secondary && (
              <Button variant="secondary" onClick={secondary.onClick}>
                {secondary.label}
              </Button>
            )}
          </div>
        }
      />
    );
  }

  return (
    <MotionRoot>
      <section aria-labelledby="run-title" className="py-6 md:py-12">
        <h1 id="run-title" className="font-display text-2xl font-[400] tracking-[-0.01em] text-ink md:text-3xl">
          {phase === "failed" ? "Your route isn't ready" : heading}
        </h1>
        <p aria-live="polite" className="mt-3 min-h-7 text-lg text-ink-muted">
          {phase === "failed" ? "" : status_}
        </p>

        {/* Wide screens: one survey line across the page. */}
        <div className="mt-12 hidden lg:block">
          <Route
            variant="survey"
            width={ROUTE_W}
            height={74}
            points={POINTS}
            activeIndex={Math.min(stage, POINTS.length - 1)}
            stateOf={(i) =>
              i < stage ? "done" : i === stage ? (phase === "done" ? "destination" : phase === "failed" ? "upcoming" : "current") : i === POINTS.length - 1 ? "destination" : "upcoming"
            }
            className="h-auto w-full"
            label={`Progress: ${status_}`}
          />
          <ol aria-hidden className="relative mt-3 h-12">
            {[...STAGES, "Your route"].map((label, i, all) => (
              <li
                key={label}
                // End labels align to the edges so they never spill outside the column.
                className={`absolute w-28 text-sm leading-snug ${
                  i === 0 ? "text-left" : i === all.length - 1 ? "-translate-x-full text-right" : "-translate-x-1/2 text-center"
                } ${i === stage && phase !== "failed" ? "font-medium text-ink" : i < stage ? "text-ink" : "text-ink-muted"}`}
                style={{
                  left: i === 0 ? 0 : i === all.length - 1 ? "100%" : `${(POINTS[i].x / ROUTE_W) * 100}%`,
                }}
              >
                {label}
              </li>
            ))}
          </ol>
        </div>

        {/* Phones and tablets: the same stages as a vertical route. */}
        <div className="mt-10 lg:hidden">
          <WaypointList aria-hidden>
            {[...STAGES, "Your route"].map((label, i) => (
              <Waypoint
                key={label}
                label={label}
                last={i === STAGES.length}
                state={i < stage ? "done" : i === stage ? (phase === "running" ? "current" : phase === "done" ? "destination" : "upcoming") : "upcoming"}
              />
            ))}
          </WaypointList>
        </div>

        <p aria-live="polite" className="mt-10 min-h-6 max-w-[60ch] text-base text-ink-muted">
          {wait}
        </p>

        {failureBlock}
      </section>
    </MotionRoot>
  );
}
