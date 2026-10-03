"use client";

import { forwardRef, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeyHint } from "@/components/pp/key-hint";

export const TITLE_ID = "wizard-title";
export const HELP_ID = "wizard-help";
export const ERROR_ID = "wizard-error";

/** Step title (Fraunces) + one-line "why we ask". The title takes focus for screen readers when needed. */
export const StepHeading = forwardRef<HTMLHeadingElement, { title: string; help?: ReactNode }>(function StepHeading(
  { title, help },
  ref
) {
  return (
    <div>
      <h1
        ref={ref}
        id={TITLE_ID}
        tabIndex={-1}
        className="font-display text-2xl font-[400] tracking-[-0.01em] text-balance text-ink outline-none"
      >
        {title}
      </h1>
      {help && (
        <p id={HELP_ID} className="mt-2 max-w-[56ch] text-base text-ink-muted">
          {help}
        </p>
      )}
    </div>
  );
});

export function StepError({ message }: { message: string | null }) {
  return (
    <p id={ERROR_ID} role={message ? "alert" : undefined} className="min-h-6 pt-3 text-sm text-danger">
      {message}
    </p>
  );
}

export function StepFooter({
  onBack,
  onContinue,
  canGoBack,
  continueLabel = "Continue",
  showEnterHint = true,
  extra,
}: {
  onBack: () => void;
  onContinue: () => void;
  canGoBack: boolean;
  continueLabel?: string;
  showEnterHint?: boolean;
  /** e.g. "Back to review" */
  extra?: ReactNode;
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-contour pt-6">
      <Button
        variant="quiet"
        onClick={onBack}
        disabled={!canGoBack}
        aria-keyshortcuts="Alt+ArrowLeft"
        className="-ml-3"
      >
        <ArrowLeft data-icon="inline-start" />
        Back
      </Button>
      <div className="flex items-center gap-3">
        {extra}
        {showEnterHint && <KeyHint>↵</KeyHint>}
        <Button onClick={onContinue} aria-keyshortcuts={showEnterHint ? "Enter" : undefined}>
          {continueLabel}
        </Button>
      </div>
    </div>
  );
}
