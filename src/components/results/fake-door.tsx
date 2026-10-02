"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FAKE_DOOR } from "@/config/fake-door";
import { track } from "@/lib/analytics";

/** Measures interest in a paid feature. Renders nothing unless FAKE_DOOR.enabled. */
export function FakeDoor({ enabled = FAKE_DOOR.enabled }: { enabled?: boolean }) {
  const [stage, setStage] = useState<"offer" | "ask" | "done">("offer");
  if (!enabled) return null;

  return (
    <section aria-label="Coming next" aria-live="polite" className="mt-12 rounded-panel border border-contour bg-sheet p-6 print:hidden">
      {stage === "offer" && (
        <>
          <p className="font-display text-xl font-[420] text-ink">{FAKE_DOOR.headline}</p>
          <p className="mt-2 max-w-[56ch] text-base text-ink-muted">{FAKE_DOOR.body}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Button
              onClick={() => {
                track("pricing_intent_clicked", { price: FAKE_DOOR.price });
                setStage("ask");
              }}
            >
              {FAKE_DOOR.cta}
            </Button>
            <span className="font-mono text-sm text-ink">{FAKE_DOOR.price}</span>
          </div>
        </>
      )}
      {stage === "ask" && (
        <>
          <p className="font-display text-xl font-[420] text-ink">{FAKE_DOOR.followUpTitle}</p>
          <p className="mt-2 max-w-[56ch] text-base text-ink-muted">{FAKE_DOOR.followUpBody}</p>
          <Button
            className="mt-5"
            onClick={() => {
              track("waitlist_joined");
              setStage("done");
            }}
          >
            {FAKE_DOOR.confirm}
          </Button>
        </>
      )}
      {stage === "done" && <p className="text-base text-ink">{FAKE_DOOR.thanks}</p>}
    </section>
  );
}
