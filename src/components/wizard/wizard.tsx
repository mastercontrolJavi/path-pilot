"use client";

import { useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { AnalysisRun, type RunOutcome } from "@/components/analysis/analysis-run";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MotionRoot } from "@/components/pp/motion-root";
import { stepVariants, useReducedMotion } from "@/lib/motion";
import { track } from "@/lib/analytics";
import { clearLocalStorageState, useHydrated, useLocalStorageState } from "@/lib/use-local-storage";
import {
  EMPTY_ANSWERS,
  REVIEW_INDEX,
  STEPS,
  firstIncomplete,
  timeLeftLabel,
  validateStep,
  type Answers,
  type CvState,
} from "./steps";
import { CvStep } from "./cv-step";
import { AUTO_ADVANCE_MS, QuestionStep } from "./question-step";
import { ReviewStep } from "./review-step";
import { CompactPath, PathRail } from "./path-rail";
import { StepFooter } from "./step-chrome";

type Draft = { v: 1; answers: Answers; step: number; furthest: number; cvMode: CvState["mode"] };
const EMPTY_DRAFT: Draft = { v: 1, answers: EMPTY_ANSWERS, step: 0, furthest: 0, cvMode: "upload" };

export type SubmitFn = (input: { answers: Answers; cv: CvState; onSent: () => void }) => Promise<RunOutcome>;

const UNREADABLE =
  "We couldn't read text in that PDF. It may be a scanned image: export it as a text PDF, or paste your CV text instead.";

const clamp = (n: number) => Math.min(Math.max(0, Number.isFinite(n) ? n : 0), REVIEW_INDEX);

const isTypingTarget = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

/**
 * The question flow. Answers autosave to this browser (keyed per user) as you
 * type; the CV itself is never stored on the device. Order is unchanged: CV,
 * questions, review.
 */
export function Wizard({
  storageKey,
  submit,
  onDone,
  status,
}: {
  storageKey: string;
  submit: SubmitFn;
  onDone: (analysisId: string) => void;
  /** Override the analysis status check (design preview only). */
  status?: ComponentProps<typeof AnalysisRun>["status"];
}) {
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  const [draft, setDraft] = useLocalStorageState<Draft>(storageKey, EMPTY_DRAFT);
  const answers = useMemo<Answers>(() => ({ ...EMPTY_ANSWERS, ...draft.answers }), [draft.answers]);
  const step = clamp(draft.step);
  const furthest = Math.max(step, clamp(draft.furthest));

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState("");
  const cv: CvState = { mode: draft.cvMode ?? "upload", file: cvFile, text: cvText };

  const [dir, setDir] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  // Once, after hydration: welcome back, or count a fresh start.
  const greeted = useRef(false);
  useEffect(() => {
    if (!hydrated || greeted.current) return;
    greeted.current = true;
    if (draft.furthest > 0) {
      toast("Picked up where you left off", {
        description: "Your answers were saved on this device. You'll add your CV again before building your route.",
      });
    } else {
      track("wizard_started");
    }
  }, [hydrated, draft.furthest]);

  function go(index: number, direction: number) {
    setDir(direction);
    setError(null);
    setDraft((d) => ({ ...d, step: index, furthest: Math.max(d.furthest, index) }));
    window.scrollTo({ top: 0 });
  }

  function setAnswer<K extends keyof Answers>(field: K, value: Answers[K]) {
    setDraft((d) => ({ ...d, answers: { ...EMPTY_ANSWERS, ...d.answers, [field]: value } }));
    if (error) setError(null);
  }

  function next() {
    const current = STEPS[step];
    const problemText = validateStep(current, answers, cv);
    if (problemText) {
      setError(problemText);
      return;
    }
    track("wizard_step_completed", { step: current.id });
    go(Math.min(step + 1, REVIEW_INDEX), 1);
  }

  function back() {
    if (step > 0) go(step - 1, -1);
  }

  /** Single choice: show the confirmed row for a beat, then move on (unless they've already moved). */
  function choose(field: keyof Answers, value: string) {
    setAnswer(field, value as Answers[typeof field]);
    const at = step;
    window.setTimeout(() => {
      setDraft((d) => (d.step !== at ? d : { ...d, step: at + 1, furthest: Math.max(d.furthest, at + 1) }));
      setDir(1);
      setError(null);
      track("wizard_step_completed", { step: STEPS[at].id });
    }, AUTO_ADVANCE_MS);
  }

  // Alt/⌘ + ← goes back (not while typing, where it moves the caret).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (running || isTypingTarget(e.target)) return;
      if ((e.altKey || e.metaKey) && e.key === "ArrowLeft" && step > 0) {
        e.preventDefault();
        go(step - 1, -1);
      }
      // On the upload step and choice questions, Enter continues when focus isn't on a control.
      const s = STEPS[step];
      const enterContinues =
        (s.kind === "cv" && cv.mode === "upload") || (s.kind === "question" && s.question.type !== "text");
      if (e.key === "Enter" && enterContinues) {
        const el = e.target as HTMLElement;
        if (!el.closest("button, a, label, [role=tab], [role=radio], [role=checkbox]")) {
          e.preventDefault();
          next();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function build() {
    const missing = firstIncomplete(answers, cv);
    if (missing !== null) {
      go(missing, -1);
      setError(validateStep(STEPS[missing], answers, cv));
      return;
    }
    track("wizard_completed");
    setRunning(true);
    window.scrollTo({ top: 0 });
  }

  if (!hydrated) return <WizardSkeleton />;

  // "Build my route" hands over to the survey; the wizard stays mounted underneath in state only.
  if (running) {
    return (
      <AnalysisRun
        start={({ onSent }) => submit({ answers, cv, onSent })}
        status={status}
        onFinished={(analysisId) => {
          clearLocalStorageState(storageKey);
          onDone(analysisId);
        }}
        onUnreadable={() => {
          setRunning(false);
          go(0, -1);
          setError(UNREADABLE);
        }}
        secondary={{ label: "Back to your answers", onClick: () => setRunning(false) }}
      />
    );
  }

  const current = STEPS[step];
  const backToReview =
    furthest >= REVIEW_INDEX && step < REVIEW_INDEX ? (
      <Button
        variant="quiet"
        onClick={() => {
          const problemText = validateStep(current, answers, cv);
          if (problemText) setError(problemText);
          else go(REVIEW_INDEX, 1);
        }}
      >
        Back to review
      </Button>
    ) : null;

  let content: ReactNode;
  if (current.kind === "cv") {
    content = (
      <>
        <CvStep
          cv={cv}
          error={error}
          onContinue={next}
          onChange={(nextCv) => {
            setCvFile(nextCv.file);
            setCvText(nextCv.text);
            if (nextCv.mode !== draft.cvMode) setDraft((d) => ({ ...d, cvMode: nextCv.mode }));
            setError(null);
          }}
        />
        <StepFooter onBack={back} onContinue={next} canGoBack={false} showEnterHint={cv.mode === "upload"} extra={backToReview} />
      </>
    );
  } else if (current.kind === "question") {
    const field = current.question.fieldName as keyof Answers;
    content = (
      <>
        <QuestionStep
          question={current.question}
          value={answers[field] ?? ""}
          onChange={(value) => setAnswer(field, value as Answers[typeof field])}
          onChoose={(value) => choose(field, value)}
          onContinue={next}
          error={error}
        />
        <StepFooter onBack={back} onContinue={next} canGoBack extra={backToReview} />
      </>
    );
  } else {
    content = (
      <ReviewStep
        answers={answers}
        cv={cv}
        onEdit={(i) => go(i, -1)}
        onBuild={build}
        onBack={back}
      />
    );
  }

  const railProps = { current: step, furthest, answers, cv, onJump: (i: number) => go(i, i < step ? -1 : 1) };

  return (
    <MotionRoot>
      <LayoutGroup>
        <div className="lg:grid lg:grid-cols-[240px_minmax(0,640px)] lg:justify-between lg:gap-12 xl:grid-cols-[280px_minmax(0,640px)]">
          <aside className="hidden lg:block">
            <PathRail {...railProps} />
          </aside>
          <div className="min-w-0">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1 lg:hidden">
                <CompactPath {...railProps} />
              </div>
              <p className="hidden text-sm text-ink-muted lg:block">
                Step <span className="font-mono text-ink">{step + 1}</span> of{" "}
                <span className="font-mono text-ink">{STEPS.length}</span>
              </p>
              <p className="shrink-0 text-sm text-ink-muted">{timeLeftLabel(step)}</p>
            </div>
            <p className="sr-only" aria-live="polite">
              {`Step ${step + 1} of ${STEPS.length}: ${current.short}.`}
            </p>
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={current.id}
                custom={dir}
                variants={stepVariants(reduced)}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {content}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </LayoutGroup>
    </MotionRoot>
  );
}

/** Same shape as the loaded wizard, so nothing shifts when answers arrive from storage. */
function WizardSkeleton() {
  return (
    <div aria-busy className="lg:grid lg:grid-cols-[240px_minmax(0,640px)] lg:justify-between lg:gap-12 xl:grid-cols-[280px_minmax(0,640px)]">
      <div className="hidden flex-col gap-5 lg:flex">
        {STEPS.map((s) => (
          <div key={s.id} className="flex items-center gap-3">
            <Skeleton className="size-[18px] rounded-full" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        ))}
      </div>
      <div>
        <div className="mb-8 flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="mt-3 h-5 w-2/3" />
        <Skeleton className="mt-8 h-56 w-full rounded-panel" />
      </div>
    </div>
  );
}
