"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Printer } from "lucide-react";
import type { AnalysisResult } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { MotionRoot } from "@/components/pp/motion-root";
import { DestinationList } from "@/components/report/destination-list";
import { PayView } from "@/components/report/pay-view";
import { SkillGaps } from "@/components/report/skill-gaps";
import { PlanItinerary } from "@/components/report/plan-itinerary";
import { FeedbackWidget } from "@/components/analysis/feedback-widget";
import { useReducedMotion } from "@/lib/motion";
import { formatDate } from "@/lib/format";
import { track } from "@/lib/analytics";
import { TerrainMap } from "./terrain-map";
import { SectionNav, type NavSection } from "./section-nav";
import { FakeDoor } from "./fake-door";
import {
  ConfidenceNote,
  CvRewrites,
  DestinationHero,
  PrintDetails,
  ResultSection,
  RolesToSkip,
  Strengths,
} from "./sections";

const SECTIONS: NavSection[] = [
  { id: "destinations", label: "Destinations" },
  { id: "pay", label: "Pay" },
  { id: "gaps", label: "Skill gaps" },
  { id: "plan", label: "Plan" },
  { id: "strengths", label: "Strengths" },
  { id: "skip", label: "Roles to skip" },
  { id: "cv", label: "CV rewrites" },
];

/**
 * The destination: a brief made for one person. Header, the best-fit reveal,
 * then sections in the order people act on them. `analysisId` keys plan
 * progress in this browser and feedback in the database.
 */
export function ResultsView({
  analysisId,
  result,
  createdAt,
  feedback = true,
}: {
  analysisId: string;
  result: AnalysisResult;
  createdAt: string;
  /** Off in the design preview (no account to attach feedback to). */
  feedback?: boolean;
}) {
  const reduced = useReducedMotion();
  // Keyboard focus wins over the pointer, so a scroll under a resting mouse can't steal the highlight.
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const highlight = focused ?? hovered;
  const onHighlight = (i: number | null, source: "hover" | "focus") => (source === "focus" ? setFocused(i) : setHovered(i));
  const paths = result.career_paths;
  const best = paths[0];
  const hasMap = useMemo(() => paths.every((p) => p.salary_estimate), [paths]);

  useEffect(() => {
    track("results_viewed");
  }, []);

  function selectRow(i: number) {
    const row = document.getElementById(`result-destination-row-${i}`);
    row?.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
    row?.querySelector<HTMLButtonElement>("button[aria-expanded]")?.focus({ preventScroll: true });
  }

  return (
    <MotionRoot>
      <article className="pb-16">
        <header className="flex flex-col gap-6 pt-2 pb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[46rem]">
            <p className="text-sm text-ink-muted">Your route</p>
            <h1 className="mt-2 font-display text-2xl font-[400] tracking-[-0.01em] text-balance text-ink">
              Your experience points most strongly toward {best.title}.
            </h1>
            <p className="mt-4 max-w-[62ch] text-lg text-ink-muted">{result.summary}</p>
            <p className="mt-4 text-sm text-ink-muted">
              Generated{" "}
              <time dateTime={createdAt} className="font-mono text-ink">
                {formatDate(createdAt)}
              </time>
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3 print:hidden">
            <Button
              variant="quiet"
              onClick={() => {
                track("pdf_downloaded");
                window.print();
              }}
            >
              <Printer data-icon="inline-start" />
              Save as PDF
            </Button>
            <Link href="/new" className={buttonVariants({ variant: "secondary" })}>
              Start a new route
            </Link>
          </div>
        </header>

        <DestinationHero path={best} />

        <div className="mt-16 lg:grid lg:grid-cols-[176px_minmax(0,1fr)] lg:gap-14">
          <aside className="lg:pt-1">
            <SectionNav sections={SECTIONS} />
          </aside>

          <div className="mt-10 flex min-w-0 flex-col gap-20 lg:mt-0">
            <ResultSection
              id="destinations"
              title="Destinations"
              intro="Ranked by how directly your experience transfers. Open a role for what it involves and the titles to search."
            >
              {hasMap && (
                <div className="mb-10 print:break-inside-avoid">
                  <TerrainMap paths={paths} highlight={highlight} onHighlight={onHighlight} onSelect={selectRow} />
                </div>
              )}
              <DestinationList
                paths={paths}
                idPrefix="result-destination"
                showRank={hasMap}
                highlight={highlight}
                onHighlight={onHighlight}
              />
              <PrintDetails paths={paths} />
            </ResultSection>

            <ResultSection id="pay" title="Pay" className="print:break-before-page">
              <PayView paths={paths} />
            </ResultSection>

            <ResultSection id="gaps" title="Skill gaps" intro="What carries over, and what to build first.">
              <SkillGaps paths={paths} idPrefix="result-gaps" />
            </ResultSection>

            <ResultSection
              id="plan"
              title="Your first seven days"
              intro="One step a day. Tick them off as you go; progress is saved in this browser."
              className="print:break-before-page"
            >
              <PlanItinerary
                steps={result.action_plan}
                storageKey={`pp:plan:${analysisId}`}
                onToggle={(step, checked) => track("plan_task_checked", { step, checked })}
              />
              <FakeDoor />
            </ResultSection>

            <ResultSection id="strengths" title="Strengths" intro="What your CV shows you're good at, with the evidence.">
              <Strengths strengths={result.strengths} />
            </ResultSection>

            <ResultSection id="skip" title="Roles to skip" intro="Routes that look close but would take you back to what you want to leave.">
              <RolesToSkip roles={result.avoid_roles} />
            </ResultSection>

            <ResultSection id="cv" title="CV rewrites" intro="Lines from your CV, rewritten for the roles above." className="print:break-before-page">
              <CvRewrites rewrites={result.cv_rewrites} />
            </ResultSection>

            <ConfidenceNote note={result.confidence_note} />
            {feedback && <FeedbackWidget analysisId={analysisId} />}
          </div>
        </div>
      </article>
    </MotionRoot>
  );
}
