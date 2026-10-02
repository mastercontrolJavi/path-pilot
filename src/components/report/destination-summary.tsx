import type { ReactNode } from "react";
import type { CareerPath } from "@/lib/schemas";
import { MatchMeter } from "@/components/pp/match-meter";
import { describeMoneyRange, formatMoneyRange } from "@/lib/format";

/** Collapsed destination row: name, why you fit, match and pay. Server-safe. */
export function DestinationSummary({
  path,
  rank,
  animate = false,
  delay = 0,
  showRank = false,
  children,
}: {
  path: CareerPath;
  rank: number;
  animate?: boolean;
  delay?: number;
  /** Show the rank number (results page, where the map refers to it). */
  showRank?: boolean;
  /** Trailing controls, e.g. the details toggle. */
  children?: ReactNode;
}) {
  const pay = path.salary_estimate;
  return (
    <div className="grid gap-x-10 gap-y-4 py-6 md:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        {rank === 0 && <p className="mb-1.5 text-sm text-ink-muted">Best fit</p>}
        <h3 className="font-display text-xl font-[420] tracking-[-0.01em] text-pretty text-ink md:text-2xl">
          {showRank && <span className="mr-3 font-mono text-base font-normal text-ink-faint">{rank + 1}</span>}
          {path.title}
        </h3>
        <p className="mt-2 max-w-[62ch] text-base text-ink-muted">{path.why_it_fits}</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 md:flex-col md:items-end md:pt-1">
        <MatchMeter value={path.fit_score} animate={animate} delay={delay} label={`Match for ${path.title}`} />
        {pay && (
          <p className="font-mono text-base text-ink">
            <span aria-hidden>{formatMoneyRange(pay.low, pay.high, pay.currency, pay.period)}</span>
            <span className="sr-only">Typical pay {describeMoneyRange(pay.low, pay.high, pay.currency, pay.period)}</span>
          </p>
        )}
      </div>
      {children && <div className="md:col-span-2">{children}</div>}
    </div>
  );
}

/** Expanded detail for a destination row. Server-safe. */
export function DestinationDetails({ path, id }: { path: CareerPath; id?: string }) {
  const pay = path.salary_estimate;
  return (
    <dl id={id} className="grid gap-x-10 gap-y-6 pb-8 md:grid-cols-2">
      <div>
        <dt className="text-sm font-medium text-ink">Why it&apos;s realistic</dt>
        <dd className="mt-1.5 text-base text-ink-muted">{path.why_it_is_realistic}</dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-ink">The tradeoff</dt>
        <dd className="mt-1.5 text-base text-ink-muted">{path.tradeoff}</dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-ink">Best for</dt>
        <dd className="mt-1.5 text-base text-ink-muted">{path.best_for}</dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-ink">Titles to search for</dt>
        <dd className="mt-2">
          <ul className="flex flex-wrap gap-1.5">
            {path.example_job_titles.map((title) => (
              <li key={title} className="rounded-full bg-fog px-2.5 py-1 text-sm text-ink">
                {title}
              </li>
            ))}
          </ul>
        </dd>
      </div>
      {pay && (
        <div className="md:col-span-2">
          <dt className="text-sm font-medium text-ink">About the pay estimate</dt>
          <dd className="mt-1.5 text-base text-ink-muted">
            {pay.basis}. An estimate, not live market data.
          </dd>
        </div>
      )}
    </dl>
  );
}
