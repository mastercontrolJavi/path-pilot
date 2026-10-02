"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { ErrorState } from "@/components/pp/states";
import { AnalysisRun, checkStatus, type RunOutcome } from "./analysis-run";
import { retryAnalysis } from "./retry";
import { STALE_AFTER_MS } from "./stages";
import { useHydrated } from "@/lib/use-local-storage";

/**
 * An analysis that's still running (opened from the dashboard, or after a
 * reload). Polls until it finishes. If it has been "processing" for longer
 * than the function limit allows, it has stopped: offer a retry instead.
 */
export function AnalysisWaiting({ analysisId, createdAt }: { analysisId: string; createdAt: string }) {
  // Elapsed time depends on the clock, so render after hydration to keep server and client in step.
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <section className="py-6 md:py-12">
        <h1 className="font-display text-2xl font-[400] tracking-[-0.01em] text-ink md:text-3xl">Building your route</h1>
      </section>
    );
  }
  return <Waiting analysisId={analysisId} createdAt={createdAt} />;
}

function Waiting({ analysisId, createdAt }: { analysisId: string; createdAt: string }) {
  const router = useRouter();
  const [startedAt] = useState(() => Date.now());
  const attempts = useRef(0);
  const age = startedAt - new Date(createdAt).getTime();

  async function waitForIt(): Promise<RunOutcome> {
    // First attempt watches this analysis; "Try again" re-runs it from the saved CV and answers.
    if (attempts.current++ > 0) return retryAnalysis(analysisId);
    if (Date.now() - new Date(createdAt).getTime() > STALE_AFTER_MS) return { ok: false, kind: "timeout" };
    for (;;) {
      const status = await checkStatus(analysisId).catch(() => "processing" as const);
      if (status === "completed") return { ok: true, analysisId };
      if (status === "failed") return { ok: false, kind: "failed" };
      if (Date.now() - new Date(createdAt).getTime() > STALE_AFTER_MS) return { ok: false, kind: "timeout" };
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  return (
    <AnalysisRun
      start={waitForIt}
      sentAlready
      initialSeconds={Math.max(0, Math.round(age / 1000))}
      signInRedirect={`/analysis/${analysisId}`}
      onFinished={(id) => (id === analysisId ? router.refresh() : router.push(`/analysis/${id}`))}
      secondary={{ label: "Start a new route", onClick: () => router.push("/new") }}
    />
  );
}

/** An analysis that failed: say so plainly, retry from what's saved. */
export function AnalysisFailed({ analysisId }: { analysisId: string }) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  if (retrying) {
    return (
      <AnalysisRun
        start={() => retryAnalysis(analysisId)}
        sentAlready
        signInRedirect={`/analysis/${analysisId}`}
        onFinished={(id) => router.push(`/analysis/${id}`)}
        secondary={{ label: "Start a new route", onClick: () => router.push("/new") }}
      />
    );
  }

  return (
    <div className="py-6 md:py-12">
      <ErrorState
        title="This analysis didn't finish"
        description="This is usually temporary. Trying again reuses the CV and answers you already gave, so there's nothing to re-enter."
        action={
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setRetrying(true)}>Try again</Button>
            <Link href="/new" className={buttonVariants({ variant: "secondary" })}>
              Start a new route
            </Link>
          </div>
        }
      />
    </div>
  );
}
