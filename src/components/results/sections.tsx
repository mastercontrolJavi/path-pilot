import type { ReactNode } from "react";
import type { AnalysisResult, CareerPath } from "@/lib/schemas";
import { MatchMeter } from "@/components/pp/match-meter";
import { RangeBar } from "@/components/pp/range-bar";
import { DestinationDetails } from "@/components/report/destination-summary";
import { cn } from "@/lib/utils";

/** Section shell: an anchor for the section nav, a Fraunces title, an optional one-line intro. */
export function ResultSection({
  id,
  title,
  intro,
  children,
  className,
}: {
  id: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} data-result-section={id} className={cn("scroll-mt-32 lg:scroll-mt-24", className)}>
      <h2 id={`${id}-title`} className="font-display text-2xl font-[400] tracking-[-0.01em] text-ink">
        {title}
      </h2>
      {intro && <p className="mt-2 max-w-[62ch] text-base text-ink-muted">{intro}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

/**
 * The best-fit destination. The page's one orchestrated moment: the panel
 * settles in, the match meter fills (0.8s) and the pay range draws. Static
 * with reduced motion.
 */
export function DestinationHero({ path }: { path: CareerPath }) {
  const pay = path.salary_estimate;
  return (
    <section aria-labelledby="best-fit-title" className="pp-settle rounded-feature border border-contour bg-sheet p-6 md:p-10">
      <p className="text-sm text-ink-muted">Best fit</p>
      <h2 id="best-fit-title" className="mt-1 font-display text-3xl font-[420] tracking-[-0.015em] text-pretty text-ink">
        {path.title}
      </h2>
      <div className={cn("mt-8 grid gap-8", pay && "md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-14")}>
        <div>
          <p className="mb-2 text-sm text-ink-muted">Match</p>
          <MatchMeter value={path.fit_score} animate delay={0.3} label={`Match for ${path.title}`} />
        </div>
        {pay && (
          <div>
            <p className="-mb-3 text-sm text-ink-muted">Typical pay</p>
            <RangeBar low={pay.low} high={pay.high} currency={pay.currency} period={pay.period} animate delay={0.5} />
          </div>
        )}
      </div>
      <p className="mt-6 max-w-[62ch] text-lg text-ink">{path.why_it_fits}</p>
      {pay && <p className="mt-3 text-sm text-ink-muted">{pay.basis}. An estimate, not live market data.</p>}
    </section>
  );
}

export function Strengths({ strengths }: { strengths: AnalysisResult["strengths"] }) {
  return (
    <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
      {strengths.map((s) => (
        <li key={s.name} className="border-t border-contour pt-5">
          <h3 className="font-display text-xl font-[420] text-ink">{s.name}</h3>
          <div className="mt-3 flex items-center gap-3">
            <MatchMeter
              value={s.score * 10}
              size="sm"
              showValue={false}
              label={`Evidence for ${s.name}`}
              valueText={`${s.score} out of 10`}
            />
            <span className="font-mono text-sm text-ink">{s.score}/10</span>
          </div>
          <p className="mt-3 text-base text-ink">{s.evidence}</p>
          <p className="mt-2 text-sm text-ink-muted">{s.why_it_matters}</p>
        </li>
      ))}
    </ul>
  );
}

export function RolesToSkip({ roles }: { roles: AnalysisResult["avoid_roles"] }) {
  return (
    <ul className="divide-y divide-contour border-y border-contour">
      {roles.map((r) => (
        <li key={r.role_type} className="grid gap-x-10 gap-y-1 py-5 md:grid-cols-[minmax(0,16rem)_1fr]">
          <p className="font-medium text-ink">{r.role_type}</p>
          <p className="text-base text-ink-muted">{r.reason}</p>
        </li>
      ))}
    </ul>
  );
}

export function CvRewrites({ rewrites }: { rewrites: AnalysisResult["cv_rewrites"] }) {
  return (
    <ol className="flex flex-col gap-10">
      {rewrites.map((r, i) => (
        <li key={i} className="grid gap-x-8 gap-y-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-ink-muted">Before</p>
            <p className="mt-1.5 text-base text-ink-muted">{r.before}</p>
          </div>
          <div className="border-l-2 border-forest pl-4">
            <p className="text-sm text-forest">After</p>
            <p className="mt-1.5 text-base text-ink">{r.after}</p>
          </div>
          <p className="text-sm text-ink-muted md:col-span-2">{r.why_better}</p>
        </li>
      ))}
    </ol>
  );
}

export function ConfidenceNote({ note }: { note: string }) {
  return (
    <p role="note" className="max-w-[68ch] rounded-panel bg-fog/70 px-5 py-4 text-sm text-ink-muted">
      {note}
    </p>
  );
}

/** Print only: the detail that's behind toggles on screen. */
export function PrintDetails({ paths }: { paths: CareerPath[] }) {
  return (
    <div className="hidden print:block">
      {paths.map((path) => (
        <div key={path.title} className="break-inside-avoid pt-6">
          <p className="font-display text-xl text-ink">{path.title}</p>
          <div className="mt-3">
            <DestinationDetails path={path} />
          </div>
          {path.skills_you_bring.length > 0 && (
            <p className="text-sm text-ink">
              <span className="font-medium">You bring:</span> {path.skills_you_bring.join(", ")}
            </p>
          )}
          {path.skills_to_build.length > 0 && (
            <p className="mt-1 text-sm text-ink">
              <span className="font-medium">To build:</span>{" "}
              {path.skills_to_build.map((s) => `${s.skill} (${s.how})`).join("; ")}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
