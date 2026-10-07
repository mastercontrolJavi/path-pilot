"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupChip } from "@/components/ui/radio-group";
import { Wizard } from "@/components/wizard/wizard";
import type { RunOutcome } from "@/components/analysis/analysis-run";
import { CheckEmail } from "@/components/auth/check-email";

const OUTCOMES = [
  ["ok", "Success"],
  ["slow", "Slow (35s)"],
  ["failed", "Analysis failed"],
  ["unreadable", "Unreadable PDF"],
  ["network", "Network error"],
  ["session", "Signed out"],
  ["rate_limited", "Rate limited"],
] as const;
type Outcome = (typeof OUTCOMES)[number][0];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** The real wizard and survey with a mock submit, for review without an account or API keys. */
export function WizardPreview() {
  const [outcome, setOutcome] = useState<Outcome>("ok");

  async function mockSubmit({ onSent }: { onSent: () => void }): Promise<RunOutcome> {
    await wait(900);
    if (outcome === "session") return { ok: false, kind: "session" };
    if (outcome === "network") return { ok: false, kind: "network" };
    if (outcome === "rate_limited") return { ok: false, kind: "rate_limited", retryAt: Date.now() + 23 * 60_000 };
    onSent();
    await wait(outcome === "slow" ? 35_000 : 7_000);
    if (outcome === "unreadable") return { ok: false, kind: "unreadable" };
    return { ok: true, analysisId: "preview" };
  }

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-wrap items-center gap-3 rounded-panel border border-contour bg-sheet px-4 py-3 text-sm text-ink-muted">
        <span>Preview outcome for “Build my route”:</span>
        <RadioGroup
          value={outcome}
          onValueChange={(v) => setOutcome(v as Outcome)}
          aria-label="Preview outcome"
          className="flex w-auto flex-wrap gap-2"
        >
          {OUTCOMES.map(([value, label]) => (
            <RadioGroupChip key={value} value={value}>
              {label}
            </RadioGroupChip>
          ))}
        </RadioGroup>
      </div>

      <Wizard
        storageKey="pp:wizard:v1:design-preview"
        submit={mockSubmit}
        status={async () => (outcome === "failed" ? "failed" : "completed")}
        onDone={() => toast.success("Route built (preview only, nothing was sent)")}
      />

      <section aria-labelledby="check-email-title" className="border-t border-contour pt-12">
        <h2 id="check-email-title" className="mb-8 text-sm text-ink-muted">
          Sign-up confirmation screen
        </h2>
        <div className="max-w-sm">
          <CheckEmail email="maya@gmail.com" emailRedirectTo="http://localhost/auth/callback" onUseDifferentEmail={() => {}} />
        </div>
      </section>
    </div>
  );
}
