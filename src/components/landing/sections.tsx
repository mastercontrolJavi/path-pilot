import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Check, FileText, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { KeyHint } from "@/components/pp/key-hint";
import { MatchMeter } from "@/components/pp/match-meter";
import { NodeDot } from "@/components/pp/waypoint";
import { SampleReportStatic } from "@/components/report/sample-report-static";
import { sampleProfile, sampleReport } from "@/lib/fixtures/sample-report";
import { formatMoneyRange } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Faq } from "./faq";
import { LazySampleReport } from "./lazy-sections";

const container = "mx-auto max-w-page px-4 sm:px-6";
const sectionY = "py-20 md:py-32";
const h2 = "font-display text-2xl font-[400] tracking-[-0.015em] text-balance text-ink md:text-3xl";

const best = sampleReport.career_paths[0];

/* ------------------------------------------------------------------ */
/* One route instead of 40 tabs                                        */
/* ------------------------------------------------------------------ */

const TABS = [
  "operations jobs near me",
  "Product operations manager salary",
  "what can I do with 6 years in ops?",
  "25 transferable skills employers want",
  "Customer success vs account management",
  "Intro to SQL for beginners | Course",
  "is implementation a dead end",
  "How to write a career change CV",
  "Remote jobs for operations people",
];
// Fixed offsets and tilts: a quiet, slightly chaotic pile (static, no animation).
const SHIFT = [0, 28, 8, 44, 16, 52, 4, 36, 20];
const TILT = [-1.2, 0.8, -0.4, 1.4, -1, 0.6, -1.6, 0.4, 1];

function TabPile() {
  return (
    <div
      role="img"
      aria-label="A pile of open browser tabs: job boards, salary pages, skills listicles and forum threads."
      className="relative flex max-w-[420px] flex-col"
    >
      {TABS.map((title, i) => (
        <div
          key={title}
          aria-hidden
          className={cn(
            "-mt-2 flex h-10 w-[78%] min-w-0 items-center gap-2.5 rounded-t-[10px] rounded-b-[3px] border border-contour px-3 text-sm text-ink-muted first:mt-0",
            i % 2 === 0 ? "bg-fog" : "bg-sheet"
          )}
          style={{ transform: `translateX(${SHIFT[i]}px) rotate(${TILT[i]}deg)`, zIndex: i } as CSSProperties}
        >
          <span className="size-3 shrink-0 rounded-[3px] bg-contour" />
          <span className="min-w-0 flex-1 truncate">{title}</span>
          <X className="size-3.5 shrink-0 stroke-[1.5] text-ink-faint" />
        </div>
      ))}
    </div>
  );
}

function ReportExcerpt() {
  const pay = best.salary_estimate!;
  return (
    <div className="rounded-panel border border-contour bg-sheet p-6 md:p-8">
      <p className="text-sm text-ink-muted">Best fit</p>
      <p className="mt-1 font-display text-2xl font-[420] tracking-[-0.01em] text-ink">{best.title}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <MatchMeter value={best.fit_score} />
        <p className="font-mono text-base text-ink">{formatMoneyRange(pay.low, pay.high, pay.currency, pay.period)}</p>
      </div>
      <div className="mt-6 border-t border-contour pt-5">
        <p className="text-sm font-medium text-ink">You bring</p>
        <ul className="mt-2.5 flex flex-wrap gap-2">
          {best.skills_you_bring.slice(0, 3).map((s) => (
            <li key={s} className="rounded-full bg-moss/55 px-3 py-1 text-sm text-ink">
              {s}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm font-medium text-ink">To build first</p>
        <p className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-4 text-base text-ink">
          {best.skills_to_build[0].skill}
          <span className="text-sm text-ink-muted">A few weeks</span>
        </p>
      </div>
    </div>
  );
}

export function TabsVsRoute() {
  return (
    <section aria-labelledby="tabs-title" className={cn(sectionY, "border-t border-contour")}>
      <div className={container}>
        <div className="max-w-[40rem]">
          <h2 id="tabs-title" className={h2}>
            One route instead of 40 tabs
          </h2>
          <p className="mt-4 text-lg text-ink-muted">
            Everything you&apos;d piece together from a dozen sites, built from your actual experience.
          </p>
        </div>
        <div className="mt-14 grid items-center gap-14 md:grid-cols-2 md:gap-10">
          <TabPile />
          <ReportExcerpt />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

function Fragment({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden inert className="mt-5 rounded-control border border-contour bg-sheet p-3.5">
      {children}
    </div>
  );
}

const STEPS: { title: string; body: string; ui: ReactNode }[] = [
  {
    title: "Upload your CV",
    body: "A PDF, or paste the text.",
    ui: (
      <div className="flex items-center gap-3">
        <FileText className="size-[18px] shrink-0 stroke-[1.5] text-ink-muted" />
        <span className="min-w-0 flex-1 truncate text-sm text-ink">cv-2026.pdf</span>
        <span className="font-mono text-xs text-ink-muted">182 KB</span>
        <span className="inline-flex items-center gap-1 text-sm text-success">
          <Check className="size-4 stroke-2" />
          Ready
        </span>
      </div>
    ),
  },
  {
    title: "Answer a few questions",
    body: "What you want, what you won't do, where you'll work.",
    ui: (
      <>
        <p className="font-display text-base text-ink">Where do you want to work?</p>
        <div className="mt-2.5 flex h-10 items-center justify-between rounded-control border border-edge bg-paper px-3 text-sm text-ink">
          Remote, US
          <KeyHint>↵</KeyHint>
        </div>
      </>
    ),
  },
  {
    title: "Get your route",
    body: "Roles you fit, typical pay, the gaps, and a seven-day plan.",
    ui: (
      <>
        <p className="font-display text-base text-ink">{best.title}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <MatchMeter value={best.fit_score} size="sm" />
          <span className="font-mono text-sm text-ink">
            {formatMoneyRange(best.salary_estimate!.low, best.salary_estimate!.high)}
          </span>
        </div>
      </>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className={cn(sectionY, "scroll-mt-16 border-t border-contour")}>
      <div className={container}>
        <h2 id="how-title" className={h2}>
          How it works
        </h2>
        <ol className="mt-14 grid md:grid-cols-3 md:gap-10">
          {STEPS.map((step, i) => {
            const last = i === STEPS.length - 1;
            return (
              <li key={step.title} className={cn("relative flex gap-5 md:flex-col md:gap-6", !last && "pb-12 md:pb-0")}>
                {!last && (
                  <span
                    aria-hidden
                    className="absolute top-7 bottom-1 left-[10.25px] w-[1.5px] rounded-full bg-forest md:top-[10.25px] md:right-[-2.5rem] md:bottom-auto md:left-8 md:h-[1.5px] md:w-auto"
                  />
                )}
                <span className="relative z-10 mt-0.5 grid size-[22px] shrink-0 place-items-center bg-paper md:mt-0">
                  <NodeDot state={last ? "destination" : "done"} size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm text-ink-faint">{i + 1}</p>
                  <h3 className="mt-1 font-display text-xl font-[420] text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-base text-ink-muted">{step.body}</p>
                  <Fragment>{step.ui}</Fragment>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sample report                                                       */
/* ------------------------------------------------------------------ */

export function SampleSection() {
  return (
    <section id="sample" aria-labelledby="sample-title" className={cn(sectionY, "scroll-mt-16 border-t border-contour")}>
      <div className={container}>
        <div className="max-w-[44rem]">
          <h2 id="sample-title" className={h2}>
            A sample report
          </h2>
          <p className="mt-4 text-lg text-ink-muted">
            {/* Built as one string: SWC drops the space before "years" when the text node holds an entity. */}
            {`Built for an ${sampleProfile.role.toLowerCase()} with ${sampleProfile.years} years' experience who wants out. `}
            The person isn&apos;t real, and pay figures are estimates. Everything else works the way your report
            will.
          </p>
        </div>
        <div className="mt-12">
          <LazySampleReport>
            <SampleReportStatic />
          </LazySampleReport>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Who it's for                                                        */
/* ------------------------------------------------------------------ */

export function Audience() {
  return (
    <section aria-labelledby="who-title" className={cn(sectionY, "border-t border-contour")}>
      <div className={container}>
        <h2 id="who-title" className={h2}>
          Who it&apos;s for
        </h2>
        <div className="mt-14 grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="border-t-2 border-forest pt-6 md:col-span-6">
            <h3 className="font-display text-2xl font-[420] text-ink">Changing careers</h3>
            <p className="mt-3 max-w-[46ch] text-lg text-ink-muted">
              You&apos;ve spent years getting good at something and want to point it somewhere new. See which roles
              your experience already fits and what stands between you and them.
            </p>
          </div>
          <div className="border-t border-contour pt-6 md:col-span-3">
            <h3 className="font-display text-xl font-[420] text-ink">Between jobs</h3>
            <p className="mt-3 text-base text-ink-muted">
              Laid off, returning, relocating or stuck. Get a short list of realistic roles and a first week of
              steps, instead of applying everywhere.
            </p>
          </div>
          <div className="border-t border-contour pt-6 md:col-span-3">
            <h3 className="font-display text-xl font-[420] text-ink">Starting out</h3>
            <p className="mt-3 text-base text-ink-muted">
              Recently graduated? Get roles that fit what you&apos;ve actually done, including the projects and
              part-time work you might be underselling.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Privacy and FAQ                                                     */
/* ------------------------------------------------------------------ */

export function PrivacySummary() {
  return (
    <section aria-labelledby="privacy-title" className={cn(sectionY, "border-t border-contour")}>
      <div className={cn(container, "grid gap-8 md:grid-cols-12 md:gap-10")}>
        <h2 id="privacy-title" className={cn(h2, "md:col-span-5")}>
          What happens to your CV
        </h2>
        <div className="md:col-span-7">
          {/* Sourced from the Privacy Policy, sections 3 to 5. */}
          <p className="max-w-[62ch] text-lg text-ink-muted">
            Your CV text and answers are sent to OpenAI&apos;s API to write your report, and OpenAI&apos;s API
            policy says it doesn&apos;t use that data to train its models by default. Your file and report are
            stored with Supabase, where access is limited to your account. We don&apos;t sell your data, and you
            can ask us to delete everything at any time.
          </p>
          <Link
            href="/privacy"
            className="mt-5 inline-block text-base text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-forest"
          >
            Read the privacy policy
          </Link>
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section aria-labelledby="faq-title" className={cn(sectionY, "border-t border-contour")}>
      <div className={cn(container, "grid gap-10 md:grid-cols-12")}>
        <h2 id="faq-title" className={cn(h2, "md:col-span-4")}>
          Questions
        </h2>
        <div className="md:col-span-8">
          <Faq />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final call to action                                                */
/* ------------------------------------------------------------------ */

export function FinalCta({ ctaHref }: { ctaHref: string }) {
  return (
    <section aria-labelledby="final-title" className={cn(sectionY, "border-t border-contour")}>
      <div className={container}>
        <h2 id="final-title" className="max-w-[18ch] font-display text-3xl font-[400] tracking-[-0.02em] text-balance text-ink">
          Find out where your experience can take you.
        </h2>
        <Link
          href={ctaHref}
          className={cn(buttonVariants({ size: "lg" }), "mt-10")}
          data-track="landing_cta_clicked"
          data-track-location="final"
        >
          Map my next move
        </Link>
      </div>
    </section>
  );
}
