"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupChip } from "@/components/ui/radio-group";
import { Wizard, type SubmitResult } from "@/components/wizard/wizard";
import { CheckEmail } from "@/components/auth/check-email";

const OUTCOMES = [
  ["ok", "Success"],
  ["unreadable", "Unreadable PDF"],
  ["network", "Network error"],
  ["session", "Signed out"],
] as const;

/** The real wizard with a mock submit, for review without an account or API keys. */
export function WizardPreview() {
  const [outcome, setOutcome] = useState<(typeof OUTCOMES)[number][0]>("ok");

  async function mockSubmit(): Promise<SubmitResult> {
    await new Promise((r) => setTimeout(r, 1200));
    if (outcome === "ok") return { ok: true, analysisId: "preview" };
    return { ok: false, kind: outcome };
  }

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-wrap items-center gap-3 rounded-panel border border-contour bg-sheet px-4 py-3 text-sm text-ink-muted">
        <span>Preview outcome for “Build my route”:</span>
        <RadioGroup
          value={outcome}
          onValueChange={(v) => setOutcome(v as typeof outcome)}
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
