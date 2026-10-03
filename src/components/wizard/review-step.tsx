"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STEPS, REVIEW_INDEX, summarize, validateStep, type Answers, type CvState } from "./steps";
import { StepHeading } from "./step-chrome";

/** Every answer, editable in place, then the one primary action: Build my route. */
export function ReviewStep({
  answers,
  cv,
  onEdit,
  onBuild,
  onBack,
}: {
  answers: Answers;
  cv: CvState;
  onEdit: (index: number) => void;
  onBuild: () => void;
  onBack: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus({ preventScroll: true }), []);

  return (
    <div>
      <StepHeading ref={headingRef} title="Check your answers" help="Change anything you like, then build your route." />

      <dl className="mt-8 border-t border-contour">
        {STEPS.slice(0, REVIEW_INDEX).map((step, i) => {
          const summary = summarize(step, answers, cv);
          const missing = validateStep(step, answers, cv);
          const label = step.kind === "question" ? step.question.label : "Your CV";
          return (
            <div key={step.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-1 border-b border-contour py-4">
              <dt className="text-sm text-ink-muted">{label}</dt>
              <dd className="col-start-1 row-start-2 min-w-0 text-base text-ink">
                {summary ? (
                  <span className="line-clamp-2">{summary}</span>
                ) : missing ? (
                  <span className="text-danger">Needs an answer</span>
                ) : (
                  <span className="text-ink-muted">Skipped</span>
                )}
              </dd>
              <dd className="row-span-2 self-center">
                <button
                  type="button"
                  onClick={() => onEdit(i)}
                  aria-label={`Edit: ${label}`}
                  className={cn(
                    "min-h-11 cursor-pointer rounded-control px-1 text-sm font-medium underline underline-offset-4 md:min-h-9",
                    missing ? "text-danger decoration-danger/40" : "text-forest decoration-forest/40 hover:decoration-forest"
                  )}
                >
                  {missing ? "Answer" : "Edit"}
                </button>
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <Button variant="quiet" onClick={onBack} className="-ml-3">
          Back
        </Button>
        <Button size="lg" onClick={onBuild}>
          Build my route
        </Button>
      </div>
      <p className="mt-4 text-sm text-ink-muted">
        Your CV and answers are sent to OpenAI to write the report.{" "}
        <Link href="/privacy" className="rounded-control text-forest underline decoration-forest/40 underline-offset-4">
          Privacy policy
        </Link>
      </p>
    </div>
  );
}
