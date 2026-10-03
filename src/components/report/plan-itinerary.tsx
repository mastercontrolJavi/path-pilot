"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/schemas";
import { Checkbox } from "@/components/ui/checkbox";
import { NodeDot } from "@/components/pp/waypoint";
import { useLocalStorageState } from "@/lib/use-local-storage";
import { cn } from "@/lib/utils";

type Step = AnalysisResult["action_plan"][number];

const NONE: number[] = [];

/**
 * The 7-day plan as an itinerary along the Route. Checked days turn moss; the
 * first open day is "you are here". With `storageKey`, progress persists in
 * this browser; without it (the sample), it lasts for the visit.
 */
export function PlanItinerary({
  steps,
  storageKey = null,
  onToggle,
}: {
  steps: Step[];
  storageKey?: string | null;
  onToggle?: (step: number, checked: boolean) => void;
}) {
  const [stored, setStored] = useLocalStorageState<number[]>(storageKey, NONE);
  const [visit, setVisit] = useState<number[]>(NONE);
  const done = storageKey ? stored : visit;
  const setDone = storageKey ? setStored : setVisit;

  const firstOpen = steps.find((s) => !done.includes(s.step))?.step;

  const toggle = (step: number, checked: boolean) => {
    setDone(checked ? [...done.filter((d) => d !== step), step] : done.filter((d) => d !== step));
    onToggle?.(step, checked);
  };

  return (
    <div className="max-w-[52rem] pt-2">
      <p className="text-sm text-ink-muted" aria-live="polite">
        <span className="font-mono text-ink">{done.length}</span> of <span className="font-mono text-ink">{steps.length}</span>{" "}
        days done
      </p>
      <ol className="mt-6">
        {steps.map((s, i) => {
          const isDone = done.includes(s.step);
          const state = isDone ? "done" : s.step === firstOpen ? "current" : "upcoming";
          const last = i === steps.length - 1;
          return (
            <li key={s.step} className="relative flex gap-4" aria-current={state === "current" ? "step" : undefined}>
              {!last && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-7 bottom-1 left-[10.25px] w-[1.5px] rounded-full",
                    isDone ? "bg-forest" : "bg-contour"
                  )}
                />
              )}
              <span className="relative z-10 mt-1 grid size-[22px] shrink-0 place-items-center">
                <NodeDot state={state} size={22} />
              </span>
              <div className={cn("flex min-w-0 flex-1 flex-wrap items-start justify-between gap-x-6 gap-y-2", !last && "pb-7")}>
                <div className="min-w-0 max-w-[60ch]">
                  <p className="font-mono text-xs text-ink-faint">Day {s.step}</p>
                  <h3 className={cn("mt-0.5 text-base font-medium", isDone ? "text-ink-muted" : "text-ink")}>{s.title}</h3>
                  <p className="mt-1 text-base text-ink-muted">{s.details}</p>
                </div>
                <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-ink-muted md:min-h-9">
                  <Checkbox
                    checked={isDone}
                    onCheckedChange={(checked) => toggle(s.step, checked === true)}
                    aria-label={`Mark day ${s.step} done: ${s.title}`}
                  />
                  <span aria-hidden>Done</span>
                </label>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
