"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Waypoint, WaypointList } from "@/components/pp/waypoint";
import type { NodeState } from "@/components/pp/route";
import { cn } from "@/lib/utils";
import { STEPS, summarize, validateStep, type Answers, type CvState } from "./steps";

type RailProps = {
  current: number;
  furthest: number;
  answers: Answers;
  cv: CvState;
  onJump: (index: number) => void;
};

function stepState(i: number, { current, furthest, answers, cv }: RailProps): { state: NodeState; chip: string | null; muted?: boolean } {
  if (i === current) return { state: "current", chip: null };
  if (i > furthest) return { state: "upcoming", chip: null };
  const step = STEPS[i];
  if (step.kind === "review") return { state: "upcoming", chip: null };
  const problem = validateStep(step, answers, cv);
  const summary = summarize(step, answers, cv);
  if (problem) return { state: "upcoming", chip: step.kind === "cv" ? "Add your CV" : "Needs an answer", muted: true };
  return { state: "done", chip: summary ?? "Skipped", muted: !summary };
}

function RailList(props: RailProps & { morph?: boolean; onAfterJump?: () => void }) {
  const { current, furthest, onJump, morph, onAfterJump } = props;
  return (
    <WaypointList>
      {STEPS.map((step, i) => {
        const { state, chip, muted } = stepState(i, props);
        const canJump = i !== current && i <= furthest;
        return (
          <Waypoint
            key={step.id}
            state={state}
            label={step.short}
            last={i === STEPS.length - 1}
            onSelect={
              canJump
                ? () => {
                    onJump(i);
                    onAfterJump?.();
                  }
                : undefined
            }
          >
            {chip && (
              <motion.span
                layoutId={morph && step.kind === "question" ? `answer-${step.id}` : undefined}
                className={cn(
                  "w-fit max-w-full truncate rounded-full px-2.5 py-0.5 text-xs",
                  muted ? "bg-fog text-ink-muted" : "bg-moss/55 text-ink"
                )}
              >
                {chip}
              </motion.span>
            )}
          </Waypoint>
        );
      })}
    </WaypointList>
  );
}

/** Desktop: the vertical Route beside the question. */
export function PathRail(props: RailProps) {
  return (
    <nav aria-label="Your path" className="sticky top-24">
      <RailList {...props} morph />
      <p className="mt-2 text-xs text-ink-faint">Answers save as you go.</p>
    </nav>
  );
}

/** Mobile: a compact segmented path; tap for every step and answer. */
export function CompactPath(props: RailProps) {
  const [open, setOpen] = useState(false);
  const { current } = props;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Step ${current + 1} of ${STEPS.length}. Show all steps and answers`}
        className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-control"
      >
        <span aria-hidden className="flex flex-1 gap-1">
          {STEPS.map((step, i) => {
            const { state } = stepState(i, props);
            return (
              <span
                key={step.id}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  state === "current" ? "bg-blaze" : state === "done" ? "bg-forest" : "bg-contour"
                )}
              />
            );
          })}
        </span>
        <span aria-hidden className="font-mono text-xs text-ink-muted">
          {current + 1}/{STEPS.length}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-auto bottom-0 left-0 max-h-[85vh] max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-b-none sm:max-w-none">
          <DialogTitle>Your path</DialogTitle>
          <DialogDescription>Tap any answered step to change it. Answers save as you go.</DialogDescription>
          <div className="mt-2">
            <RailList {...props} onAfterJump={() => setOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
